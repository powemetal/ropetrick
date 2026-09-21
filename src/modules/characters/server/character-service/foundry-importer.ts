"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { parseFoundryActor } from "@/modules/characters/server/foundry-parser";

export async function importFoundryCharacter(userId: string, rawJson: unknown) {
  return createCharacterFromFoundry(userId, rawJson);
}

export async function createCharacterFromFoundry(userId: string, rawJson: unknown) {
  const parsed = parseFoundryActor(rawJson);

  const abilities = (parsed.stats.abilities as Record<string, any>) || {};
  const getScore = (key: string) => abilities[key]?.value ?? 10;
  const getMod = (score: number) => Math.floor((score - 10) / 2);

  const [strength, dexterity, constitution, intelligence, wisdom, charisma] = [getScore("str"), getScore("dex"), getScore("con"), getScore("int"), getScore("wis"), getScore("cha")];
  const spellConnectionsMap = new Map<string, { spellId: string; prepared: boolean; learned: boolean }>();

  for (const s of parsed.extractedSpells) {
    const cleanName = s.name.trim();
    let spell = await prisma.spell.findFirst({ where: { name: { equals: cleanName, mode: "insensitive" } }, select: { id: true } });

    if (!spell) {
      spell = await prisma.spell.create({
        data: {
          slug: `custom-${cleanName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString(36)}`,
          name: cleanName,
          level: s.level,
          school: s.school || "universal",
          castingTime: s.castingTime || "action",
          range: s.range || "self",
          components: { v: true, s: true },
          duration: "Instantanée",
          concentration: s.concentration,
          description: s.description || "Sort importé de Foundry VTT.",
          source: "Foundry Import",
        },
        select: { id: true },
      });
    }
    spellConnectionsMap.set(spell.id, { spellId: spell.id, prepared: true, learned: true });
  }

  const inventoryConnections = [];
  for (const invItem of parsed.extractedItems) {
    const cleanItemName = invItem.name.trim();
    let eqItem = await prisma.equipmentItem.findFirst({ where: { name: { equals: cleanItemName, mode: "insensitive" } }, select: { id: true } });

    if (!eqItem) {
      eqItem = await prisma.equipmentItem.create({
        data: {
          slug: `foundry-${cleanItemName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString(36)}`,
          name: cleanItemName,
          category: invItem.type || "loot",
          type: invItem.type === "weapon" ? "WEAPON" : invItem.type === "equipment" ? "ARMOR" : "GEAR",
          description: invItem.description || cleanItemName,
          costGp: invItem.price || 0,
          weightLb: invItem.weight || 0,
        },
        select: { id: true },
      });
    }
    inventoryConnections.push({ itemId: eqItem.id, quantity: invItem.quantity, isEquipped: invItem.equipped });
  }

  const formattedFeats = parsed.extractedFeats
    .map((feat) => ({
      name: feat.name ?? "Inconnu",
      description: feat.description ?? "",
      requirements: feat.requirements ?? null,
      featureType: feat.featureType ?? "feat",
    }))
    .filter((feat) => feat.featureType !== "class");

  return prisma.character.create({
    data: {
      userId,
      name: parsed.name,
      avatarUrl: parsed.avatarUrl,
      race: parsed.race,
      class: parsed.class,
      subclass: parsed.subclass,
      level: parsed.level,
      backstory: parsed.backstory,
      foundryActorId: parsed.foundryActorId,
      foundryVersion: parsed.foundryVersion,
      rawImportData: parsed.rawImportData,
      stats: parsed.stats,
      themeKey: "warrior",
      notebookTheme: "parchment",
      strength,
      dexterity,
      constitution,
      intelligence,
      wisdom,
      charisma,
      strengthMod: getMod(strength),
      dexterityMod: getMod(dexterity),
      constitutionMod: getMod(constitution),
      intelligenceMod: getMod(intelligence),
      wisdomMod: getMod(wisdom),
      charismaMod: getMod(charisma),
      currentHitPoints: (parsed.stats.hitPoints as any)?.current ?? 10,
      maxHitPoints: (parsed.stats.hitPoints as any)?.max ?? 10,
      armorClass: (parsed.stats.armorClass as number) ?? 10,
      selectedFeats: formattedFeats as Prisma.InputJsonValue,
      spells: spellConnectionsMap.size > 0 ? { create: Array.from(spellConnectionsMap.values()) } : undefined,
      inventoryItems: inventoryConnections.length > 0 ? { create: inventoryConnections } : undefined,
    },
  });
}
