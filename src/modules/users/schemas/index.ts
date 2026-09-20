import { z } from "zod";

export const UserSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  name: z.string().min(1),
  nickname: z.string().min(1),
  avatarUrl: z.string().url().nullable().optional(),
});

export const UserBlockSchema = z.object({
  blockerId: z.string().min(1),
  blockedId: z.string().min(1),
});

export const MessageReportSchema = z.object({
  reporterId: z.string().min(1),
  messageId: z.string().min(1),
  reason: z.enum(["SPAM", "HARASSMENT", "INAPPROPRIATE", "OTHER"]),
});

export const MessageReportReasonSchema = z.enum(["SPAM", "HARASSMENT", "INAPPROPRIATE", "OTHER"]);
