"use server";

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCampaignMemberRole, requireCampaignManagerAccess } from "@/modules/campaigns/server/campaign-service";
import { SessionFeedbackSchema, SessionLogCreateSchema } from "@/modules/sessions/schemas";
import type { NotebookTheme, RsvpStatus } from "@/modules/campaigns/components/SessionTomeView";

type SessionRelations = {
  attendeeUserIds?: string[];
  attendeeCharacters?: Array<{ userId: string; characterId?: string | null }>;
  locationIds?: string[];
  npcIds?: string[];
};

export async function createSessionLog(campaignId: string, dmUserId: string, data: unknown, relations: SessionRelations = {}) {
  await requireCampaignManagerAccess(campaignId, dmUserId);
  const input = SessionLogCreateSchema.parse(data);
  const sessionNumber = input.sessionNumber || ((await prisma.sessionLog.aggregate({ where: { campaignId }, _max: { sessionNumber: true } }))._max.sessionNumber ?? 0) + 1;
  const memberIds = new Set((await prisma.campaignMember.findMany({ where: { campaignId }, select: { userId: true } })).map((member) => member.userId));
  const attendees: Array<{ userId: string; characterId?: string | null }> = relations.attendeeCharacters ?? relations.attendeeUserIds?.map((userId) => ({ userId })) ?? [];
  const validAttendees = attendees.filter((attendee) => memberIds.has(attendee.userId));

  return prisma.$transaction(async (transaction) => {
    const session = await transaction.sessionLog.create({ data: { ...input, campaignId, sessionNumber } });
    if (validAttendees.length) await transaction.sessionAttendee.createMany({ data: validAttendees.map((attendee) => ({ sessionId: session.id, userId: attendee.userId, characterId: attendee.characterId ?? null })) });
    if (relations.locationIds?.length) await transaction.sessionVisitedLocation.createMany({ data: relations.locationIds.map((locationId) => ({ sessionId: session.id, locationId })) });
    if (relations.npcIds?.length) await transaction.sessionMetNPC.createMany({ data: relations.npcIds.map((npcId) => ({ sessionId: session.id, npcId })) });
    return transaction.sessionLog.findUnique({ where: { id: session.id }, include: { attendees: { include: { user: true, character: true } }, visitedLocations: { include: { location: true } }, metNpcs: { include: { npc: true } }, feedback: true } });
  });
}

export async function submitSessionFeedback(sessionId: string, userId: string, rating: number | null, comment: string, isPublic: boolean) {
  const input = SessionFeedbackSchema.parse({ sessionId, userId, rating, comment, isPublic });
  const session = await prisma.sessionLog.findUnique({ where: { id: sessionId }, select: { campaignId: true } });
  if (!session || !(await getCampaignMemberRole(session.campaignId, userId))) throw new Error("Campaign access denied");
  const existingFeedback = await prisma.sessionFeedback.findFirst({ where: { sessionId, userId }, select: { id: true } });
  return existingFeedback ? prisma.sessionFeedback.update({ where: { id: existingFeedback.id }, data: { rating, comment, isPublic } }) : prisma.sessionFeedback.create({ data: input });
}

export async function updateSessionLog(campaignId: string, dmUserId: string, sessionId: string, data: unknown, relations: SessionRelations = {}) {
  await requireCampaignManagerAccess(campaignId, dmUserId);
  const input = SessionLogCreateSchema.parse(data);
  const session = await prisma.sessionLog.findFirst({ where: { id: sessionId, campaignId }, select: { id: true } });
  if (!session) throw new Error("Session not found");
  const memberIds = new Set((await prisma.campaignMember.findMany({ where: { campaignId }, select: { userId: true } })).map((member) => member.userId));
  const attendees: Array<{ userId: string; characterId?: string | null }> = relations.attendeeCharacters ?? relations.attendeeUserIds?.map((userId) => ({ userId })) ?? [];
  const validAttendees = attendees.filter((attendee) => memberIds.has(attendee.userId));

  return prisma.$transaction(async (transaction) => {
    await transaction.sessionLog.update({ where: { id: sessionId }, data: { ...input, campaignId } });
    await transaction.sessionAttendee.deleteMany({ where: { sessionId } });
    await transaction.sessionVisitedLocation.deleteMany({ where: { sessionId } });
    await transaction.sessionMetNPC.deleteMany({ where: { sessionId } });
    if (validAttendees.length) await transaction.sessionAttendee.createMany({ data: validAttendees.map((attendee) => ({ sessionId, userId: attendee.userId, characterId: attendee.characterId ?? null })) });
    if (relations.locationIds?.length) await transaction.sessionVisitedLocation.createMany({ data: relations.locationIds.map((locationId) => ({ sessionId, locationId })) });
    if (relations.npcIds?.length) await transaction.sessionMetNPC.createMany({ data: relations.npcIds.map((npcId) => ({ sessionId, npcId })) });
    return transaction.sessionLog.findUnique({ where: { id: sessionId }, include: { attendees: true, visitedLocations: true, metNpcs: true } });
  });
}

export async function getSessionLogs(campaignId: string, currentUserId: string) {
  const role = await getCampaignMemberRole(campaignId, currentUserId);
  if (!role) throw new Error("Campaign access denied");
  const canSeePrivate = role === "DM" || role === "CO_DM";
  const sessions = await prisma.sessionLog.findMany({
    where: { campaignId },
    include: sessionLogInclude,
    orderBy: { playedAt: "desc" },
  });

  return sessions.map((session) => sanitizeSessionLog(session, canSeePrivate));
}

const sessionLogInclude = {
  attendees: { include: { user: { select: { id: true, name: true, nickname: true } }, character: { select: { id: true, name: true } } } },
  visitedLocations: { include: { location: { select: { id: true, name: true, isSecretDm: true } } } },
  metNpcs: { include: { npc: { select: { id: true, name: true, isSecretDm: true } } } },
  feedback: { include: { user: { select: { id: true, name: true, nickname: true } } } },
} as const;

type SessionLogWithRelations = Prisma.SessionLogGetPayload<{ include: typeof sessionLogInclude }>;

function sanitizeSessionLog(session: SessionLogWithRelations, canSeePrivate: boolean) {
  return {
    ...session,
    ...(canSeePrivate ? {} : { dmNotes: null }),
    feedback: session.feedback.filter((feedback) => canSeePrivate || feedback.isPublic),
    visitedLocations: session.visitedLocations.filter((entry) => canSeePrivate || !entry.location.isSecretDm),
    metNpcs: session.metNpcs.filter((entry) => canSeePrivate || !entry.npc.isSecretDm),
  };
}

export type SessionDetail =
  | { kind: "log"; isDm: boolean; session: ReturnType<typeof sanitizeSessionLog> }
  | {
      kind: "scheduled";
      isDm: boolean;
      game: {
        id: string;
        title: string;
        dateTime: Date;
        status: string;
        attendances: Array<{ userId: string; status: string; comment: string | null; user: { id: string; name: string; nickname: string | null } }>;
      };
    };

/**
 * Resolves a session route param that may be either a SessionLog id (existing report)
 * or a ScheduledGame id (planned game with no report yet), transparently following
 * the scheduledGame -> sessionLog link once a report has been initialized.
 */
export async function getSessionDetail(campaignId: string, sessionId: string, currentUserId: string): Promise<SessionDetail | null> {
  const role = await getCampaignMemberRole(campaignId, currentUserId);
  if (!role) throw new Error("Campaign access denied");
  const isDm = role === "DM" || role === "CO_DM";

  const directLog = await prisma.sessionLog.findFirst({ where: { id: sessionId, campaignId }, include: sessionLogInclude });
  if (directLog) return { kind: "log", isDm, session: sanitizeSessionLog(directLog, isDm) };

  const scheduledGame = await prisma.scheduledGame.findFirst({
    where: { id: sessionId, campaignId },
    include: {
      attendances: { include: { user: { select: { id: true, name: true, nickname: true } } } },
      sessionLog: { include: sessionLogInclude },
    },
  });
  if (!scheduledGame) return null;
  if (scheduledGame.sessionLog) return { kind: "log", isDm, session: sanitizeSessionLog(scheduledGame.sessionLog, isDm) };

  const { sessionLog: _sessionLog, ...game } = scheduledGame;
  return { kind: "scheduled", isDm, game };
}

/** Creates (or returns the existing) SessionLog linked to a not-yet-reported ScheduledGame. */
export async function initSessionLogFromScheduledGame(campaignId: string, dmUserId: string, scheduledGameId: string, data: unknown) {
  await requireCampaignManagerAccess(campaignId, dmUserId);
  const game = await prisma.scheduledGame.findFirst({ where: { id: scheduledGameId, campaignId }, select: { id: true } });
  if (!game) throw new Error("Scheduled game not found");

  const existing = await prisma.sessionLog.findUnique({ where: { scheduledGameId }, include: sessionLogInclude });
  if (existing) return existing;

  const input = SessionLogCreateSchema.parse(data);
  const sessionNumber = input.sessionNumber || ((await prisma.sessionLog.aggregate({ where: { campaignId }, _max: { sessionNumber: true } }))._max.sessionNumber ?? 0) + 1;
  return prisma.sessionLog.create({ data: { ...input, campaignId, sessionNumber, scheduledGameId }, include: sessionLogInclude });
}

export async function getPlayerSessionNotes(sessionId: string, userId: string) {
  const sessionLog = await prisma.sessionLog.findFirst({
    where: {
      OR: [
        { id: sessionId },
        { scheduledGameId: sessionId },
      ],
    },
    select: { id: true },
  });

  if (!sessionLog) {
    return [];
  }

  return prisma.sessionNote.findMany({
    where: {
      sessionId: sessionLog.id,
      OR: [
        { isShared: true },
        { userId: userId },
      ],
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          nickname: true,
        },
      },
      character: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function upsertPlayerSessionNote(
  sessionId: string,
  userId: string,
  noteId: string | null,
  data: { title: string; content: string; isShared: boolean }
) {
  let sessionLog = await prisma.sessionLog.findFirst({
    where: {
      OR: [
        { id: sessionId },
        { scheduledGameId: sessionId },
      ],
    },
  });

  if (!sessionLog) {
    const scheduledGame = await prisma.scheduledGame.findUnique({
      where: { id: sessionId },
      include: {
        campaign: {
          include: {
            sessionLogs: {
              select: { sessionNumber: true },
              orderBy: { sessionNumber: "desc" },
              take: 1,
            },
          },
        },
      },
    });

    if (!scheduledGame) {
      throw new Error("Session introuvable");
    }

    const nextNumber =
      (scheduledGame.campaign.sessionLogs[0]?.sessionNumber ?? 0) + 1;

    sessionLog = await prisma.sessionLog.create({
      data: {
        campaignId: scheduledGame.campaignId,
        scheduledGameId: scheduledGame.id,
        sessionNumber: nextNumber,
        title: scheduledGame.title,
        playedAt: scheduledGame.dateTime,
        summary: "",
      },
    });
  }

  const attendee = await prisma.sessionAttendee.findUnique({
    where: {
      sessionId_userId: {
        sessionId: sessionLog.id,
        userId,
      },
    },
    select: {
      characterId: true,
    },
  });

  if (noteId) {
    return prisma.sessionNote.updateMany({
      where: {
        id: noteId,
        userId,
      },
      data: {
        title: data.title,
        content: data.content,
        isShared: data.isShared,
      },
    });
  }

  return prisma.sessionNote.create({
    data: {
      sessionId: sessionLog.id,
      userId,
      characterId: attendee?.characterId ?? null,
      title: data.title,
      content: data.content,
      isShared: data.isShared,
    },
  });
}

export async function updatePlayerNotebookTheme(
  campaignId: string,
  userId: string,
  themeKey: string
) {
  const campaignChar = await prisma.campaignCharacter.findFirst({
    where: {
      campaignId,
      playerId: userId,
      isActive: true,
    },
    select: { characterId: true },
  });

  if (campaignChar?.characterId) {
    await prisma.character.update({
      where: { id: campaignChar.characterId },
      data: { notebookTheme: themeKey },
    });
    return { ok: true, themeKey };
  }

  await prisma.campaignMember.updateMany({
    where: {
      campaignId,
      userId,
    },
    data: {
      dmPrivateNotes: themeKey,
    },
  });

  return { ok: true, themeKey };
}

const VALID_NOTEBOOK_THEMES: Set<string> = new Set([
  "parchment",
  "demonic",
  "shadow",
  "sylvan",
  "royal",
]);

export async function getPlayerGrimoireTheme(
  campaignId: string,
  userId: string
): Promise<NotebookTheme> {
  const campaignChar = await prisma.campaignCharacter.findFirst({
    where: {
      campaignId,
      playerId: userId,
      isActive: true,
    },
    include: {
      character: {
        select: { notebookTheme: true },
      },
    },
  });

  const charTheme = campaignChar?.character?.notebookTheme;
  if (charTheme && VALID_NOTEBOOK_THEMES.has(charTheme)) {
    return charTheme as NotebookTheme;
  }

  const member = await prisma.campaignMember.findUnique({
    where: {
      campaignId_userId: {
        campaignId,
        userId,
      },
    },
    select: { dmPrivateNotes: true },
  });

  if (member?.dmPrivateNotes && VALID_NOTEBOOK_THEMES.has(member.dmPrivateNotes)) {
    return member.dmPrivateNotes as NotebookTheme;
  }

  return "parchment";
}

export async function updatePlayerGrimoireTheme(
  campaignId: string,
  userId: string,
  theme: NotebookTheme
) {
  const campaignChar = await prisma.campaignCharacter.findFirst({
    where: {
      campaignId,
      playerId: userId,
      isActive: true,
    },
    select: { characterId: true },
  });

  if (campaignChar?.characterId) {
    await prisma.character.update({
      where: { id: campaignChar.characterId },
      data: { notebookTheme: theme },
    });
    return { ok: true, message: "Reliure scellée sur votre personnage !" };
  }

  await prisma.campaignMember.update({
    where: {
      campaignId_userId: {
        campaignId,
        userId,
      },
    },
    data: { dmPrivateNotes: theme },
  });

  return { ok: true, message: "Reliure de maître de jeu enregistrée !" };
}

export async function upsertSessionAttendance(
  sessionId: string,
  userId: string,
  status: RsvpStatus
) {
  const statusMap: Record<RsvpStatus, "ATTENDING" | "NOT_ATTENDING" | "TENTATIVE" | "NO_REPLY"> = {
    ATTENDING: "ATTENDING",
    ABSENT: "NOT_ATTENDING",
    MAYBE: "TENTATIVE",
    PENDING: "NO_REPLY",
  };

  const prismaStatus = statusMap[status];

  const sessionLog = await prisma.sessionLog.findFirst({
    where: {
      OR: [{ id: sessionId }, { scheduledGameId: sessionId }],
    },
    select: { scheduledGameId: true },
  });

  const gameId = sessionLog?.scheduledGameId ?? sessionId;

  const game = await prisma.scheduledGame.findUnique({
    where: { id: gameId },
    select: { id: true },
  });

  if (!game) {
    return { ok: false, message: "Partie planifiée introuvable pour enregistrer la présence." };
  }

  await prisma.gameAttendance.upsert({
    where: {
      gameId_userId: {
        gameId: game.id,
        userId,
      },
    },
    update: {
      status: prismaStatus,
    },
    create: {
      gameId: game.id,
      userId,
      status: prismaStatus,
    },
  });

  return { ok: true, message: "Présence mise à jour !" };
}

/**
 * Bascule l'état d'annulation d'une partie planifiée (réservé MJ)
 */
export async function toggleCancelScheduledGame(
  gameId: string,
  userId: string,
  isCancelled: boolean
) {
  const game = await prisma.scheduledGame.findUnique({
    where: { id: gameId },
    include: { campaign: { include: { members: true } } },
  });

  if (!game) return { ok: false, message: "Partie planifiée introuvable." };

  const member = game.campaign.members.find((m) => m.userId === userId);
  const isDm = member?.role === "DM" || member?.role === "CO_DM";
  if (!isDm) return { ok: false, message: "Action réservée au Maître du Jeu." };

  await prisma.scheduledGame.update({
    where: { id: gameId },
    data: {
      status: isCancelled ? "CANCELLED" : "SCHEDULED",
    } as any,
  });

  return { ok: true, message: isCancelled ? "Session déclarée annulée." : "Session rétablie." };
}

/**
 * Ajoute un invité ou un slot '?' réservé par le MJ
 */
export async function addGuestAttendance(
  gameId: string,
  userId: string,
  guestName: string
) {
  const game = await prisma.scheduledGame.findUnique({
    where: { id: gameId },
    include: { campaign: { include: { members: true } } },
  });

  if (!game) return { ok: false, message: "Partie planifiée introuvable." };

  const member = game.campaign.members.find((m) => m.userId === userId);
  const isDm = member?.role === "DM" || member?.role === "CO_DM";
  if (!isDm) return { ok: false, message: "Action réservée au Maître du Jeu." };

  const currentGuests: Array<{ id: string; name: string; status: string }> = (game as any).guests
    ? JSON.parse((game as any).guests)
    : [];

  currentGuests.push({
    id: `guest_${Date.now()}`,
    name: guestName.trim() || "Invité ?",
    status: "TENTATIVE",
  });

  await prisma.scheduledGame.update({
    where: { id: gameId },
    data: {
      guests: JSON.stringify(currentGuests),
    } as any,
  });

  return { ok: true, message: "Invité consigné à la table !" };
}

/**
 * Supprime un invité ou un slot '?' (réservé MJ)
 */
export async function removeGuestAttendance(
  gameId: string,
  userId: string,
  guestId: string
) {
  const game = await prisma.scheduledGame.findUnique({
    where: { id: gameId },
    include: { campaign: { include: { members: true } } },
  });

  if (!game) return { ok: false, message: "Partie planifiée introuvable." };

  const member = game.campaign.members.find((m) => m.userId === userId);
  const isDm = member?.role === "DM" || member?.role === "CO_DM";
  if (!isDm) return { ok: false, message: "Action réservée au Maître du Jeu." };

  const currentGuests: Array<{ id: string; name: string; status: string }> = (game as any).guests
    ? JSON.parse((game as any).guests)
    : [];

  const updatedGuests = currentGuests.filter((g) => g.id !== guestId);

  await prisma.scheduledGame.update({
    where: { id: gameId },
    data: {
      guests: JSON.stringify(updatedGuests),
    } as any,
  });

  return { ok: true, message: "Invité retiré de la table." };
}

export async function updateSessionRsvpDirect(
  sessionId: string,
  userId: string,
  status: "ATTENDING" | "TENTATIVE" | "NOT_ATTENDING"
) {
  const statusMap: Record<string, RsvpStatus> = {
    ATTENDING: "ATTENDING",
    TENTATIVE: "MAYBE",
    NOT_ATTENDING: "ABSENT",
  };

  return upsertSessionAttendance(sessionId, userId, statusMap[status]);
}