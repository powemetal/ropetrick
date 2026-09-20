import { z } from "zod";

export const ConversationSchema = z.object({
  isGroup: z.boolean().default(false),
  title: z.string().nullable().optional(),
});

export const ConversationParticipantSchema = z.object({
  conversationId: z.string().min(1),
  userId: z.string().min(1),
  isAdmin: z.boolean().default(false),
});

export const ChatMessageSchema = z.object({
  conversationId: z.string().min(1),
  senderId: z.string().min(1),
  content: z.string().min(1),
});

export const SendMessageSchema = ChatMessageSchema.omit({ senderId: true }).extend({
  attachmentUrls: z.array(z.string().url()).default([]),
});

export const MessageAttachmentSchema = z.object({
  messageId: z.string().min(1),
  fileUrl: z.string().url(),
  fileType: z.string().min(1),
});
