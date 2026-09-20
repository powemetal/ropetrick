import { z } from "zod";

export const CampaignNoteSchema = z.object({
  campaignId: z.string().min(1),
  authorId: z.string().min(1),
  isShared: z.boolean(),
  title: z.string().min(1),
  content: z.string(),
});

export const SessionLogSchema = z.object({
  campaignId: z.string().min(1),
  sessionNumber: z.number().int().positive(),
  title: z.string().min(1),
  playedAt: z.coerce.date(),
  summary: z.string(),
  dmNotes: z.string().nullable().optional(),
});

export const SessionLogCreateSchema = SessionLogSchema.omit({ campaignId: true }).extend({
  sessionNumber: z.number().int().positive().optional(),
  scheduledGameId: z.string().min(1).nullable().optional(),
});

export const SessionAttendeeSchema = z.object({
  sessionId: z.string().min(1),
  userId: z.string().min(1),
  characterId: z.string().nullable().optional(),
});

export const SessionVisitedLocationSchema = z.object({
  sessionId: z.string().min(1),
  locationId: z.string().min(1),
});

export const SessionMetNPCSchema = z.object({
  sessionId: z.string().min(1),
  npcId: z.string().min(1),
});

export const SessionFeedbackSchema = z.object({
  sessionId: z.string().min(1),
  userId: z.string().min(1),
  rating: z.number().int().min(1).max(5).nullable().optional(),
  comment: z.string(),
  isPublic: z.boolean().default(true),
});
