"use server";

import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { CampaignCreateSchema } from "@/modules/campaigns/schemas";

export type CampaignRole = "DM" | "CO_DM" | "PLAYER";

const createInviteCode = () => randomBytes(5).toString("base64url").slice(0, 8).toUpperCase();

const uniqueInviteCode = async () => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const inviteCode = createInviteCode();
    const existing = await prisma.campaign.findUnique({ where: { inviteCode }, select: { id: true } });
    if (!existing) return inviteCode;
  }
  throw new Error("Unable to generate a unique invite code");
};

export async function getCampaignMemberRole(campaignId: string, userId: string) {
  const membership = await prisma.campaignMember.findUnique({
    where: { campaignId_userId: { campaignId, userId } },
    select: { role: true },
  });
  return membership?.role ?? null;
}

const requireCampaignMember = async (campaignId: string, userId: string) => {
  const role = await getCampaignMemberRole(campaignId, userId);
  if (!role) throw new Error("Campaign access denied");
  return role;
};

const requireCampaignManager = async (campaignId: string, userId: string) => {
  const role = await requireCampaignMember(campaignId, userId);
  if (role !== "DM" && role !== "CO_DM") throw new Error("Campaign manager access required");
  return role;
};

export async function createCampaign(dmUserId: string, data: unknown) {
  const input = CampaignCreateSchema.parse(data);
  const inviteCode = await uniqueInviteCode();

  return prisma.$transaction(async (transaction) => {
    const campaign = await transaction.campaign.create({ data: { ...input, dmId: dmUserId, inviteCode } });
    await transaction.campaignMember.create({ data: { campaignId: campaign.id, userId: dmUserId, role: "DM" } });
    return campaign;
  });
}

export async function joinCampaignByCode(userId: string, inviteCode: string) {
  const campaign = await prisma.campaign.findUnique({ where: { inviteCode: inviteCode.trim().toUpperCase() } });
  if (!campaign) throw new Error("Campaign not found");

  const existingMembership = await prisma.campaignMember.findUnique({
    where: { campaignId_userId: { campaignId: campaign.id, userId } },
  });
  if (existingMembership) return campaign;

  await prisma.campaignMember.create({ data: { campaignId: campaign.id, userId, role: "PLAYER" } });
  return campaign;
}

export async function linkCharacterToCampaign(campaignId: string, characterId: string, playerId: string) {
  await requireCampaignMember(campaignId, playerId);
  const character = await prisma.character.findFirst({ where: { id: characterId, userId: playerId }, select: { id: true } });
  if (!character) throw new Error("Character ownership required");

  return prisma.campaignCharacter.create({ data: { campaignId, characterId, playerId } });
}

export async function getCampaignsByUser(userId: string) {
  return prisma.campaign.findMany({
    where: { members: { some: { userId } } },
    include: { _count: { select: { members: true, characters: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCampaignDetails(campaignId: string, currentUserId: string) {
  const role = await requireCampaignMember(campaignId, currentUserId);
  const canSeePrivateData = role === "DM" || role === "CO_DM";
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: {
      members: { include: { user: { select: { id: true, name: true, nickname: true, avatarUrl: true } } }, orderBy: { joinedAt: "asc" } },
      characters: {
        where: { isActive: true },
        include: {
          character: { select: { id: true, name: true, avatarUrl: true, class: true, level: true, stats: true } },
          player: { select: { id: true, name: true, nickname: true } },
        },
      },
    },
  });
  if (!campaign) throw new Error("Campaign not found");

  return {
    ...campaign,
    members: campaign.members.map((member) => ({
      id: member.id,
      role: member.role,
      joinedAt: member.joinedAt,
      user: member.user,
      ...(canSeePrivateData ? { dmPrivateNotes: member.dmPrivateNotes } : {}),
    })),
  };
}

export async function requireCampaignManagerAccess(campaignId: string, userId: string) {
  return requireCampaignManager(campaignId, userId);
}
