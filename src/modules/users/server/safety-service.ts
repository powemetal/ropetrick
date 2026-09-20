"use server";

import { prisma } from "@/lib/prisma";
import { MessageReportReasonSchema } from "@/modules/users/schemas";

export async function blockUser(blockerId: string, blockedId: string) {
  if (blockerId === blockedId) throw new Error("Cannot block yourself");
  return prisma.userBlock.upsert({ where: { blockerId_blockedId: { blockerId, blockedId } }, create: { blockerId, blockedId }, update: {} });
}

export async function unblockUser(blockerId: string, blockedId: string) {
  return prisma.userBlock.deleteMany({ where: { blockerId, blockedId } });
}

export async function reportMessage(reporterId: string, messageId: string, reason: string) {
  const parsedReason = MessageReportReasonSchema.parse(reason);
  const message = await prisma.chatMessage.findUnique({ where: { id: messageId }, select: { conversationId: true } });
  if (!message) throw new Error("Message not found");
  const participant = await prisma.conversationParticipant.findUnique({ where: { conversationId_userId: { conversationId: message.conversationId, userId: reporterId } } });
  if (!participant) throw new Error("Conversation access denied");
  return prisma.messageReport.create({ data: { reporterId, messageId, reason: parsedReason, status: "PENDING" } });
}
