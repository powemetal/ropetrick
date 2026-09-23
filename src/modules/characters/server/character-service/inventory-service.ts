import { prisma } from "@/lib/prisma";

export async function toggleItemAttunement(
  characterId: string,
  inventoryItemId: string,
  newAttuneState: boolean
) {
  // 1. Récupérer l'inventaire complet du personnage avec les détails des objets du compendium
  const inventory = await prisma.characterInventoryItem.findMany({
    where: { characterId },
    include: { equipment: true },
  });

  const targetItem = inventory.find((item) => item.id === inventoryItemId);
  if (!targetItem) {
    throw new Error("Objet introuvable dans l'inventaire du personnage.");
  }

  // 2. Si on tente d'harmoniser l'objet
  if (newAttuneState) {
    // Vérifier si l'objet nécessite une harmonisation
    if (targetItem.equipment && !targetItem.equipment.requiresAttunement) {
      throw new Error("Cet objet ne nécessite pas d'harmonisation.");
    }

    // Vérifier la règle des 3 objets magiques harmonisés maximum
    const currentlyAttunedCount = inventory.filter(
      (item) => item.isAttuned && item.id !== inventoryItemId
    ).length;

    if (currentlyAttunedCount >= 3) {
      throw new Error("Impossible d'harmoniser plus de 3 objets magiques simultanément.");
    }
  }

  // 3. Mettre à jour l'état d'harmonisation en base de données
  return await prisma.characterInventoryItem.update({
    where: { id: inventoryItemId },
    data: { isAttuned: newAttuneState },
    include: { equipment: true },
  });
}