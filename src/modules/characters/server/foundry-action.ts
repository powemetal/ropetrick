"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createCharacterFromFoundry } from "@/modules/characters/server/character-service"; // Ajuste le chemin selon ton arborescence

export async function importFoundryCharacterAction(formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Session expirée, veuillez vous reconnecter.");
  }

  const file = formData.get("foundryFile") as File;
  if (!file || file.size === 0) {
    throw new Error("Veuillez sélectionner un fichier JSON valide exporté de Foundry VTT.");
  }

  try {
    const textContent = await file.text();
    const jsonActor = JSON.parse(textContent);

    // Appel de ton service d'importation que l'on vient de créer
    const newCharacter = await createCharacterFromFoundry(userId, jsonActor);

    revalidatePath("/characters");
    
    // Redirection automatique vers la fiche du nouveau personnage importé
    redirect(`/characters/${newCharacter.id}`);
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error; // Laisse passer la redirection Next.js
    }
    console.error("Erreur lors de l'importation Foundry :", error);
    throw new Error("Impossible d'importer ce personnage. Vérifiez que le format du fichier JSON est bien celui d'un Acteur D&D5e Foundry.");
  }
}