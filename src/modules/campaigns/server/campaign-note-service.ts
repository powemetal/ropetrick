"use server";

import { prisma } from "@/lib/prisma";
import { getCampaignMemberRole, requireCampaignManagerAccess } from "@/modules/campaigns/server/campaign-service";

export async function getCampaignNotes(campaignId: string, userId: string) {
  const role = await getCampaignMemberRole(campaignId, userId);
  if (!role) throw new Error("Campaign access denied");
  return prisma.campaignNote.findMany({ where: { campaignId, ...(role === "DM" || role === "CO_DM" ? {} : { OR: [{ isShared: true }, { shares: { some: { userId } } }] }) }, include: { author: { select: { name: true, nickname: true } }, shares: true }, orderBy: { updatedAt: "desc" } });
}

export async function createCampaignNote(campaignId: string, userId: string, data: { title: string; content: string; isShared: boolean; imageUrl?: string | null; sharedUserIds?: string[] }) {
  const role = await getCampaignMemberRole(campaignId, userId);
  if (!role || (!data.isShared && role !== "DM" && role !== "CO_DM")) throw new Error("Campaign note access denied");
  return prisma.campaignNote.create({ data: { campaignId, authorId: userId, title: data.title, content: data.content, isShared: data.isShared, imageUrl: data.imageUrl, shares: data.sharedUserIds?.length ? { create: data.sharedUserIds.map((sharedUserId) => ({ userId: sharedUserId })) } : undefined } });
}

export async function updateCampaignNote(noteId: string, userId: string, data: { title: string; content: string; isShared: boolean; imageUrl?: string | null; sharedUserIds?: string[] }) {
  const note = await prisma.campaignNote.findUnique({ where: { id: noteId }, select: { campaignId: true, authorId: true } });
  if (!note) throw new Error("Note not found");
  const role = await getCampaignMemberRole(note.campaignId, userId);
  if (note.authorId !== userId && role !== "DM" && role !== "CO_DM") throw new Error("Note update denied");
  return prisma.$transaction(async (transaction) => {
    await transaction.campaignNoteShare.deleteMany({ where: { noteId } });
    return transaction.campaignNote.update({ where: { id: noteId }, data: { title: data.title, content: data.content, isShared: data.isShared, imageUrl: data.imageUrl, shares: data.sharedUserIds?.length ? { create: data.sharedUserIds.map((sharedUserId) => ({ userId: sharedUserId })) } : undefined } });
  });
}

export async function deleteCampaignNote(noteId: string, userId: string) {
  const note = await prisma.campaignNote.findUnique({ where: { id: noteId }, select: { campaignId: true, authorId: true } });
  if (!note) return;
  const role = await getCampaignMemberRole(note.campaignId, userId);
  if (note.authorId !== userId && role !== "DM" && role !== "CO_DM") throw new Error("Note deletion denied");
  return prisma.campaignNote.delete({ where: { id: noteId } });
}
