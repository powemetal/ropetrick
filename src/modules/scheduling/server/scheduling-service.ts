"use server";

import { prisma } from "@/lib/prisma";
import { getCampaignMemberRole, requireCampaignManagerAccess } from "@/modules/campaigns/server/campaign-service";
import { GameAttendanceSchema, ScheduleRuleCreateSchema } from "@/modules/scheduling/schemas";

type AttendanceStatus = "ATTENDING" | "NOT_ATTENDING" | "TENTATIVE" | "NO_REPLY";

const nextMatchingDay = (from: Date, dayOfWeek: number, startTime: string, weeksToAdd: number) => {
  const [hours, minutes] = startTime.split(":").map(Number);
  const candidate = new Date(from);
  candidate.setHours(hours, minutes, 0, 0);
  let daysUntil = (dayOfWeek - candidate.getDay() + 7) % 7;
  if (daysUntil === 0 && candidate <= from) daysUntil = 7;
  candidate.setDate(candidate.getDate() + daysUntil + weeksToAdd * 7);
  return candidate;
};

export async function createScheduleRule(campaignId: string, dmUserId: string, data: unknown) {
  await requireCampaignManagerAccess(campaignId, dmUserId);
  const input = ScheduleRuleCreateSchema.parse(data);
  return prisma.scheduleRule.create({ data: { ...input, campaignId } });
}

export async function generateUpcomingGames(campaignId: string, dmUserId: string, count: number) {
  await requireCampaignManagerAccess(campaignId, dmUserId);
  const safeCount = Math.min(Math.max(Math.floor(count), 1), 52);
  const rules = await prisma.scheduleRule.findMany({ where: { campaignId }, orderBy: { startTime: "asc" } });
  if (rules.length === 0) return [];

  const existingGames = await prisma.scheduledGame.findMany({
    where: { campaignId, dateTime: { gte: new Date() } },
    select: { dateTime: true },
  });
  const existingDates = new Set(existingGames.map((game) => game.dateTime.getTime()));
  const generated: Array<{ campaignId: string; scheduleRuleId: string; dateTime: Date; title: string; status: "SCHEDULED" }> = [];

  for (let index = 0; generated.length < safeCount && index < safeCount * 12; index += 1) {
    const rule = rules[index % rules.length];
    const intervalWeeks = rule.frequency === "BIWEEKLY" ? 2 : rule.frequency === "MONTHLY" ? 4 : 1;
    const occurrence = Math.floor(index / rules.length);
    const dateTime = nextMatchingDay(new Date(), rule.dayOfWeek, rule.startTime, occurrence * intervalWeeks);
    if (existingDates.has(dateTime.getTime())) continue;
    existingDates.add(dateTime.getTime());
    generated.push({ campaignId, scheduleRuleId: rule.id, dateTime, title: "Session de campagne", status: "SCHEDULED" });
  }

  if (generated.length === 0) return [];
  return prisma.$transaction(generated.map((game) => prisma.scheduledGame.create({ data: game })));
}

export async function updateAttendance(gameId: string, userId: string, status: AttendanceStatus, comment?: string | null) {
  const input = GameAttendanceSchema.parse({ gameId, userId, status, comment });
  const game = await prisma.scheduledGame.findUnique({ where: { id: gameId }, select: { campaignId: true } });
  if (!game || !(await getCampaignMemberRole(game.campaignId, userId))) throw new Error("Campaign access denied");

  return prisma.gameAttendance.upsert({
    where: { gameId_userId: { gameId, userId } },
    create: input,
    update: { status: input.status, comment: input.comment },
  });
}

export async function getCampaignSchedule(campaignId: string, currentUserId: string) {
  if (!(await getCampaignMemberRole(campaignId, currentUserId))) throw new Error("Campaign access denied");
  
  // On calcule le premier jour du mois en cours pour afficher le mois propre dans le calendrier
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [games, members] = await Promise.all([
    prisma.scheduledGame.findMany({
      // Filtre à partir du début du mois en cours (exclut le passé lointain)
      where: { 
        campaignId, 
        dateTime: { gte: startOfMonth } 
      },
      include: {
        scheduleRule: true,
        attendances: { include: { user: { select: { id: true, name: true, nickname: true } } } },
      },
      orderBy: { dateTime: "asc" },
    }),
    prisma.campaignMember.findMany({ where: { campaignId }, include: { user: { select: { id: true, name: true, nickname: true } } } }),
  ]);

  return games.map((game) => ({
    ...game,
    attendances: members.map(
      (member) =>
        game.attendances.find((attendance) => attendance.userId === member.userId) ?? {
          userId: member.userId,
          status: "NO_REPLY" as const,
          comment: null,
          user: member.user,
        },
    ),
  }));
}