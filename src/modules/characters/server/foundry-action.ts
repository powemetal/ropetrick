"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createCharacterFromFoundry } from "@/modules/characters/server/character-service";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 Mo max

export async function importFoundryCharacterAction(formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Session expirée, veuillez vous reconnecter.");
  }

  const file = formData.get("foundryFile") as File | null;
  if (!file || file.size === 0) {
    throw new Error("Veuillez sélectionner un fichier JSON valide exporté de Foundry VTT.");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Le fichier est trop volumineux (maximum 5 Mo).");
  }

  let newCharacterId: string;

  try {
    const textContent = await file.text();
    let jsonActor: unknown;

    try {
      jsonActor = JSON.parse(textContent);
    } catch {
      throw new Error("Le fichier fourni n'est pas un JSON valide.");
    }

    // Création transactionnelle du personnage
    const newCharacter = await createCharacterFromFoundry(userId, jsonActor);
    newCharacterId = newCharacter.id;

    revalidatePath("/characters");
  } catch (error) {
    console.error("❌ Erreur lors de l'importation Foundry :", error);
    if (error instanceof Error && error.message.includes("JSON valide")) {
      throw error;
    }
    throw new Error(
      "Impossible d'importer ce personnage. Vérifiez que le format du fichier JSON provient bien d'un Acteur D&D5e Foundry."
    );
  }

  // Redirection en dehors du try/catch pour garantir la compatibilité Next.js App Router
  redirect(`/characters/${newCharacterId}`);
}