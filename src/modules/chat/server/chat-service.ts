"use server";

import { prisma } from "@/lib/prisma";
import { SendMessageSchema } from "@/modules/chat/schemas";

const ensureParticipant = async (conversationId: string, userId: string) => {
  const participant = await prisma.conversationParticipant.findUnique({ where: { conversationId_userId: { conversationId, userId } }, select: { id: true, isAdmin: true } });
  if (!participant) throw new Error("Conversation access denied");
  return participant;
};

const assertNotBlocked = async (userAId: string, userBId: string) => {
  const block = await prisma.userBlock.findFirst({
    where: {
      OR: [
        { blockerId: userAId, blockedId: userBId },
        { blockerId: userBId, blockedId: userAId },
      ],
    },
  });
  if (block) throw new Error("Conversation unavailable");
};

export async function getOrCreateDirectConversation(userAId: string, userBId: string) {
  if (userAId === userBId) throw new Error("Cannot message yourself");
  await assertNotBlocked(userAId, userBId);
  const conversations = await prisma.conversation.findMany({ where: { isGroup: false, participants: { every: { userId: { in: [userAId, userBId] } } } }, include: { participants: { select: { userId: true } } } });
  const existing = conversations.find((conversation) => conversation.participants.length === 2 && conversation.participants.every((participant) => [userAId, userBId].includes(participant.userId)));
  if (existing) return existing;
  return prisma.conversation.create({ data: { isGroup: false, participants: { create: [{ userId: userAId }, { userId: userBId }] } }, include: { participants: true } });
}

export async function createGroupConversation(creatorId: string, participantIds: string[], title: string) {
  const uniqueParticipantIds = [...new Set([creatorId, ...participantIds])];
  if (uniqueParticipantIds.length < 2) throw new Error("A group requires at least two participants");
  const blocked = await prisma.userBlock.findFirst({
    where: {
      OR: uniqueParticipantIds.flatMap((userId, index) =>
        uniqueParticipantIds.slice(index + 1).flatMap((otherId) => [
          { blockerId: userId, blockedId: otherId },
          { blockerId: otherId, blockedId: userId },
        ]),
      ),
    },
  });
  if (blocked) throw new Error("One participant has blocked another");
  return prisma.conversation.create({ data: { isGroup: true, title, participants: { create: uniqueParticipantIds.map((userId) => ({ userId, isAdmin: userId === creatorId })) } }, include: { participants: true } });
}

export async function getUserConversations(userId: string) {
  return prisma.conversation.findMany({ where: { participants: { some: { userId } } }, include: { participants: { include: { user: { select: { id: true, name: true, nickname: true, avatarUrl: true } } } }, messages: { orderBy: { createdAt: "desc" }, take: 1, select: { id: true, content: true, isDeleted: true, createdAt: true, senderId: true } } }, orderBy: { createdAt: "desc" } });
}

export async function getMessages(conversationId: string, userId: string, limit = 30, cursor?: string) {
  await ensureParticipant(conversationId, userId);
  return prisma.chatMessage.findMany({ where: { conversationId }, include: { sender: { select: { id: true, name: true, nickname: true, avatarUrl: true } }, attachments: true }, orderBy: { createdAt: "desc" }, take: Math.min(Math.max(limit, 1), 100), ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}) });
}

export async function sendMessage(conversationId: string, senderId: string, content: string, attachmentUrls: string[] = []) {
  await ensureParticipant(conversationId, senderId);
  const input = SendMessageSchema.parse({ conversationId, content, attachmentUrls });
  return prisma.chatMessage.create({ data: { conversationId, senderId, content: input.content, attachments: { create: input.attachmentUrls.map((fileUrl) => ({ fileUrl, fileType: "image" })) } }, include: { attachments: true, sender: { select: { id: true, name: true, nickname: true, avatarUrl: true } } } });
}

export async function softDeleteMessage(messageId: string, userId: string) {
  const message = await prisma.chatMessage.findUnique({ where: { id: messageId }, select: { senderId: true, conversationId: true } });
  if (!message) throw new Error("Message not found");
  const participant = await ensureParticipant(message.conversationId, userId);
  if (message.senderId !== userId && !participant.isAdmin) throw new Error("Message deletion denied");
  return prisma.chatMessage.update({ where: { id: messageId }, data: { isDeleted: true } });
}
