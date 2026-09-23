import { prisma } from "@/lib/prisma";
import { ABILITIES, Ability, calculateModifier } from "../../engine/dnd-rules-engine";

export async function addHalfFeatToCharacter(
  characterId: string,
  featData: {
    featId: string;
    name: string;
    allowedAbilities: Ability[]; // Les caractéristiques valables pour ce demi-don (ex: ["strength", "constitution"])
    chosenAbility: Ability;      // Celle choisie par le joueur pour recevoir le +1
  }
) {
  // 1. Valider que la caractéristique choisie est permise par le demi-don
  if (!featData.allowedAbilities.includes(featData.chosenAbility)) {
    throw new Error(`La caractéristique ${featData.chosenAbility} n'est pas valide pour ce don.`);
  }

  // 2. Récupérer le personnage actuel
  const character = await prisma.character.findUnique({
    where: { id: characterId },
  });

  if (!character) {
    throw new Error("Personnage introuvable.");
  }

  // 3. Vérifier si le don n'a pas déjà été sélectionné (optionnel selon ta logique)
  const currentFeats = (character.selectedFeats as Array<any>) || [];
  if (currentFeats.some((f) => f.featId === featData.featId)) {
    throw new Error("Ce don a déjà été sélectionné par le personnage.");
  }

  // 4. Calculer la nouvelle valeur de la caractéristique et son modificateur
  const currentScore = character[featData.chosenAbility] as number;
  const newScore = currentScore + 1;
  const newMod = calculateModifier(newScore);

  const abilityModField = `${featData.chosenAbility}Mod` as keyof typeof character;

  // 5. Mettre à jour le personnage en base (ajout du don dans le JSON + incrémentation de la stat)
  const updatedCharacter = await prisma.character.update({
    where: { id: characterId },
    data: {
      selectedFeats: [
        ...currentFeats,
        {
          featId: featData.featId,
          name: featData.name,
          abilityIncrease: featData.chosenAbility,
        },
      ],
      [featData.chosenAbility]: newScore,
      [abilityModField]: newMod,
    },
  });

  return updatedCharacter;
}