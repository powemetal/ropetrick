import { z } from "zod";

export const CampaignSchema = z.object({
  dmId: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
  inviteCode: z.string().min(1),
});

export const CampaignCreateSchema = CampaignSchema.omit({ dmId: true, inviteCode: true });

export const CampaignMemberSchema = z.object({
  campaignId: z.string().min(1),
  userId: z.string().min(1),
  role: z.enum(["DM", "CO_DM", "PLAYER"]),
  dmPrivateNotes: z.string().nullable().optional(),
});

export const CampaignCharacterSchema = z.object({
  campaignId: z.string().min(1),
  characterId: z.string().min(1),
  playerId: z.string().min(1),
  isActive: z.boolean().default(true),
});

export const CampaignNoteShareSchema = z.object({
  noteId: z.string().min(1),
  userId: z.string().min(1),
});

export const CampaignNoteMutationSchema = z.object({
  title: z.string().min(1),
  content: z.string(),
  isShared: z.boolean(),
  imageUrl: z.string().min(1).nullable().optional(),
  sharedUserIds: z.array(z.string().min(1)).default([]),
});

export const CampaignNoteDeleteSchema = z.object({
  noteId: z.string().min(1),
});
