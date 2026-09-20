"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { CharacterNotebookSchema } from "@/modules/characters/schemas";

export async function createNote(userId: string, data: unknown) {
  const input = CharacterNotebookSchema.parse(data);
  const character = await prisma.character.findFirst({ where: { id: input.characterId, userId }, select: { id: true } });
  if (!character) throw new Error("Character not found");
  return prisma.characterNotebook.create({ data: input });
}

export async function updateNote(userId: string, noteId: string, data: unknown) {
  const input = CharacterNotebookSchema.omit({ characterId: true }).partial().parse(data);
  const note = await prisma.characterNotebook.findFirst({ where: { id: noteId, character: { userId } }, select: { id: true } });
  if (!note) throw new Error("Notebook entry not found");
  return prisma.characterNotebook.update({ where: { id: noteId }, data: input });
}

export async function deleteNote(userId: string, noteId: string) {
  const note = await prisma.characterNotebook.findFirst({ where: { id: noteId, character: { userId } }, select: { id: true } });
  if (!note) throw new Error("Notebook entry not found");
  return prisma.characterNotebook.delete({ where: { id: noteId } });
}

export async function updateNoteAction(noteId: string, formData: FormData) {
  const { userId } = await auth();
  if (!userId) return { ok: false, message: "Session expirée." };

  const input = CharacterNotebookSchema.omit({ characterId: true }).parse({
    title: formData.get("title"),
    subject: formData.get("subject"),
    content: formData.get("content"),
  });
  const note = await prisma.characterNotebook.findFirst({ where: { id: noteId, character: { userId } }, select: { id: true, characterId: true } });
  if (!note) return { ok: false, message: "Notebook entry not found" };

  await prisma.characterNotebook.update({
    where: { id: noteId },
    data: {
      title: input.title,
      subject: input.subject,
      content: input.content,
      isShared: formData.get("isShared") === "on",
    },
  });
  revalidatePath(`/characters/${note.characterId}`);
  return { ok: true, message: "Note mise à jour avec succès" };
}

export async function deleteNoteAction(noteId: string) {
  const { userId } = await auth();
  if (!userId) return { ok: false, message: "Session expirée." };

  const note = await prisma.characterNotebook.findFirst({ where: { id: noteId, character: { userId } }, select: { id: true, characterId: true } });
  if (!note) return { ok: false, message: "Notebook entry not found" };

  await prisma.characterNotebook.delete({ where: { id: noteId } });
  revalidatePath(`/characters/${note.characterId}`);
  return { ok: true, message: "Note supprimée" };
}

export async function getNotesByCharacter(userId: string, characterId: string) {
  return prisma.characterNotebook.findMany({
    where: { characterId, character: { userId } },
    include: { attachments: true },
    orderBy: { updatedAt: "desc" },
  });
}
