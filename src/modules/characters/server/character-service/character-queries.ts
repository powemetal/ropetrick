"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { CharacterCreateSchema, CharacterSheetUpdateSchema } from "@/modules/characters/schemas";
import { calculateArmorClass, calculateModifier } from "@/modules/characters/engine/dnd-rules-engine";
import { deleteStorageObject } from "@/lib/storage";

export async function fetchAvailableFeats() {
  try {
    const feats = await prisma.feats.findMany({ 
      select: { id: true, name: true, description: true, prerequisite: true }, 
      orderBy: { name: "asc" } 
    });
    return feats;
  } catch (error) {
    console.error("❌ ERREUR CRITIQUE PRISMA SUR LES DONS :", error);
    throw error; 
  }
}

export async function fetchAvailableLevelUpSpells() {
  const spells = await prisma.spell.findMany({
    select: { id: true, name: true, level: true, school: true, range: true, castingTime: true, description: true, classes: true },
    orderBy: [{ level: "asc" }, { name: "asc" }],
  });
  return spells.map((spell) => ({
    ...spell,
    classes: Array.isArray(spell.classes) ? spell.classes.filter((value): value is string => typeof value === "string") : [],
  }));
}

export async function createCharacter(userId: string, data: unknown) {
  const input = CharacterCreateSchema.parse(data);
  const constitutionModifier = calculateModifier(input.constitution ?? 10);
  const maxHitPoints = input.maxHitPoints ?? (input.hitDie ?? 8) + constitutionModifier;
  const spellIds = Array.isArray((data as { spellIds?: unknown } | null | undefined)?.spellIds) ? (data as { spellIds: unknown[] }).spellIds.filter((value): value is string => typeof value === "string" && value.length > 0) : (input.selectedSpellIds ?? []);
  const { selectedSpellIds, selectedWeaponMasteryIds, selectedLanguageIds, startingEquipmentIds, ...characterInput } = input;
  const resolvedSpellIds = spellIds.length ? spellIds : (selectedSpellIds ?? []);
  
  if (resolvedSpellIds.length && input.dndClassId) {
    const dndClass = await prisma.dndClass.findUnique({ where: { id: input.dndClassId }, select: { slug: true, name: true } });
    const spells = await prisma.spell.findMany({ where: { id: { in: resolvedSpellIds } }, select: { id: true, level: true, classes: true } });
    if (!dndClass || spells.length !== new Set(resolvedSpellIds).size || spells.some((spell) => Array.isArray(spell.classes) && spell.classes.length > 0 && !spell.classes.includes(dndClass.slug))) throw new Error("Sélection de sorts invalide pour cette classe.");
    const cantrips = spells.filter((spell) => spell.level === 0).length;
    const levelOne = spells.filter((spell) => spell.level === 1).length;
    const quotas = dndClass.slug === "wizard" ? [3, 6] : dndClass.slug === "cleric" || dndClass.slug === "druid" ? [3, Math.max(1, calculateModifier(input.wisdom ?? 10) + 1)] : dndClass.slug === "sorcerer" ? [4, 2] : dndClass.slug === "warlock" ? [2, 2] : [2, 4];
    if (cantrips !== quotas[0] || levelOne !== quotas[1]) throw new Error(`La sélection doit contenir ${quotas[0]} tours de magie et ${quotas[1]} sorts de niveau 1.`);
  }

  const selectedWeaponMastery = selectedWeaponMasteryIds?.length ? await prisma.weaponMasteryProperty.findMany({ where: { id: { in: selectedWeaponMasteryIds } }, select: { id: true } }) : [];
  const selectedLanguages = selectedLanguageIds?.length ? await prisma.language.findMany({ where: { id: { in: selectedLanguageIds } }, select: { id: true } }) : [];
  const selectedEquipment = startingEquipmentIds?.length ? await prisma.equipmentItem.findMany({ where: { id: { in: startingEquipmentIds } }, select: { id: true } }) : [];
  const selectedClassRecord = input.dndClassId ? await prisma.dndClass.findUnique({ where: { id: input.dndClassId }, select: { slug: true, resourceDefinitions: true } }) : null;
  
  if (selectedWeaponMasteryIds?.length !== selectedWeaponMastery.length) throw new Error("Maîtrise d'arme invalide.");
  if (selectedLanguageIds?.length !== selectedLanguages.length) throw new Error("Langue invalide.");
  if (startingEquipmentIds?.length !== selectedEquipment.length) throw new Error("Équipement invalide.");
  if (!selectedLanguageIds?.length) throw new Error("Au moins une langue de départ est requise.");
  
  const masteryQuota = selectedClassRecord?.slug === "fighter" ? 3 : ["barbarian", "paladin", "ranger", "rogue"].includes(selectedClassRecord?.slug ?? "") ? 2 : 0;
  if (selectedWeaponMasteryIds?.length !== masteryQuota) throw new Error(`Cette classe requiert ${masteryQuota} maîtrise(s) d'arme.`);
  
  const resourceTrackers = selectedClassRecord?.resourceDefinitions.map((definition) => {
    const formula = definition.formulaByLevel;
    const values = formula && typeof formula === "object" && !Array.isArray(formula) ? (formula as Record<string, unknown>) : {};
    const maxValue = Number(values["1"] ?? 0);
    return { name: definition.name, currentValue: maxValue, maxValue, diceFormula: definition.diceFormula, resetCondition: definition.resetCondition };
  }) ?? [];

  return prisma.character.create({
    data: { 
      ...characterInput, 
      maxHitPoints, 
      currentHitPoints: input.currentHitPoints ?? maxHitPoints, 
      constitutionMod: constitutionModifier, 
      stats: input.stats as Prisma.InputJsonValue, 
      userId, 
      spells: resolvedSpellIds.length ? { create: resolvedSpellIds.map((spellId) => ({ spellId, prepared: true, learned: true })) } : undefined, 
      weaponMasteries: selectedWeaponMasteryIds?.length ? { create: selectedWeaponMasteryIds.map((masteryId) => ({ masteryId })) } : undefined, 
      languages: selectedLanguageIds?.length ? { create: selectedLanguageIds.map((languageId) => ({ languageId })) } : undefined, 
      inventoryItems: startingEquipmentIds?.length ? { create: startingEquipmentIds.map((itemId) => ({ itemId, quantity: 1, isEquipped: false })) } : undefined, 
      resources: resourceTrackers.length ? { create: resourceTrackers } : undefined 
    },
  });
}

export async function updateCharacter(userId: string, characterId: string, data: unknown) {
  const input = CharacterSheetUpdateSchema.parse(data);
  const character = await prisma.character.findFirst({ where: { id: characterId, userId } });
  if (!character) throw new Error("Character not found");

  const currentInventory = await prisma.characterInventory.findMany({ where: { characterId }, include: { item: true } });
  const currentInventoryById = new Map(currentInventory.map((entry) => [entry.id, entry]));
  const incomingInventory = input.inventoryItems ?? [];
  const incomingInventoryIds = new Set(incomingInventory.map((entry) => entry.id));

  return prisma.$transaction(async (transaction) => {
    const itemsToDelete = currentInventory.filter((entry) => !incomingInventoryIds.has(entry.id)).map((entry) => entry.id);
    if (itemsToDelete.length) {
      await transaction.characterInventory.deleteMany({ where: { characterId, id: { in: itemsToDelete } } });
    }

    for (const inventoryItem of incomingInventory) {
      const currentEntry = currentInventoryById.get(inventoryItem.id);
      const incomingItem = inventoryItem.item;
      const itemIsTemporary = inventoryItem.id.startsWith("temp-") || incomingItem.id.startsWith("temp-") || !currentEntry;

      if (itemIsTemporary) {
        const newItem = await transaction.equipmentItem.create({
          data: {
            slug: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            name: incomingItem.name,
            category: incomingItem.category,
            description: incomingItem.name,
            type: incomingItem.type,
            costGp: incomingItem.costGp,
            weightLb: incomingItem.weightLb,
            armorClass: incomingItem.armorClass,
            properties: [],
          },
        });

        await transaction.characterInventory.create({
          data: { characterId, itemId: newItem.id, quantity: inventoryItem.quantity, isEquipped: false },
        });
        continue;
      }

      if (currentEntry) {
        await transaction.characterInventory.update({
          where: { id: currentEntry.id },
          data: { quantity: inventoryItem.quantity, isEquipped: inventoryItem.isEquipped },
        });
      }
    }

    // Extraction sécurisée des dons : on ne met à jour selectedFeats que si input.feats ou input.selectedFeats 
    // a été explicitement fourni et n'est pas undefined. S'ils sont absents de la requête partielle, on conserve l'existant.
    const resolvedFeats = (input as any).feats !== undefined 
      ? (input as any).feats 
      : (input.selectedFeats !== undefined ? input.selectedFeats : undefined);

    return transaction.character.update({
      where: { id: characterId },
      data: {
        name: input.name ?? character.name,
        class: input.class !== undefined ? input.class : character.class,
        subclass: input.subclass !== undefined ? input.subclass : character.subclass,
        strength: input.strength ?? character.strength,
        dexterity: input.dexterity ?? character.dexterity,
        constitution: input.constitution ?? character.constitution,
        intelligence: input.intelligence ?? character.intelligence,
        wisdom: input.wisdom ?? character.wisdom,
        charisma: input.charisma ?? character.charisma,
        strengthMod: calculateModifier(input.strength ?? character.strength),
        dexterityMod: calculateModifier(input.dexterity ?? character.dexterity),
        constitutionMod: calculateModifier(input.constitution ?? character.constitution),
        intelligenceMod: calculateModifier(input.intelligence ?? character.intelligence),
        wisdomMod: calculateModifier(input.wisdom ?? character.wisdom),
        charismaMod: calculateModifier(input.charisma ?? character.charisma),
        skillProficiencies: (input.skillProficiencies ?? character.skillProficiencies) as Prisma.InputJsonValue,
        themeKey: input.themeKey ?? character.themeKey,
        notebookTheme: (input as any).notebookTheme ?? character.notebookTheme,
        copperPieces: input.copperPieces ?? character.copperPieces,
        silverPieces: input.silverPieces ?? character.silverPieces,
        electrumPieces: input.electrumPieces ?? character.electrumPieces,
        goldPieces: input.goldPieces ?? character.goldPieces,
        platinumPieces: input.platinumPieces ?? character.platinumPieces,
        personalityTraits: input.personalityTraits !== undefined ? input.personalityTraits : character.personalityTraits,
        ideals: input.ideals !== undefined ? input.ideals : character.ideals,
        bonds: input.bonds !== undefined ? input.bonds : character.bonds,
        flaws: input.flaws !== undefined ? input.flaws : character.flaws,
        appearance: input.appearance !== undefined ? input.appearance : character.appearance,
        backstory: input.backstory !== undefined ? input.backstory : character.backstory,
        alliesOrganizations: input.alliesOrganizations !== undefined ? input.alliesOrganizations : character.alliesOrganizations,
        
        // Sécurisation anti-wipe robuste : si resolvedFeats est undefined, on garde impérativement character.selectedFeats
        selectedFeats: resolvedFeats !== undefined 
          ? (resolvedFeats as Prisma.InputJsonValue) 
          : (character.selectedFeats as Prisma.InputJsonValue),
      },
    });
  });
}

export async function getCharactersByUser(userId: string) {
  return prisma.character.findMany({
    where: { userId },
    include: { campaignLinks: { include: { campaign: { select: { id: true, title: true } } } } },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getSpeciesCompendium() {
  return prisma.species.findMany({
    select: { id: true, slug: true, name: true, speed: true, size: true, darkvision: true, traits: true, subspecies: { select: { id: true, slug: true, name: true, speed: true, traits: true }, orderBy: { name: "asc" } } },
    orderBy: { name: "asc" },
  });
}

export async function getCharacterCreationCompendium() {
  const [species, backgrounds, classes, spells, skills, weaponMasteries, equipment, languages, classFeatures] = await Promise.all([
    getSpeciesCompendium(), 
    prisma.background.findMany({ select: { id: true, slug: true, name: true, abilityChoices: true, originFeat: { select: { id: true, name: true, description: true } }, skillProficiencies: true }, orderBy: { name: "asc" } }), 
    prisma.dndClass.findMany({ select: { id: true, slug: true, name: true, hitDie: true, skillChoices: true, skillOptions: true, subclasses: { select: { id: true, slug: true, name: true }, orderBy: { name: "asc" } } }, orderBy: { name: "asc" } }), 
    prisma.spell.findMany({ where: { level: { in: [0, 1] } }, orderBy: [{ level: "asc" }, { name: "asc" }] }), 
    prisma.skillDefinition.findMany({ orderBy: { name: "asc" } }), 
    prisma.weaponMasteryProperty.findMany({ orderBy: { name: "asc" } }), 
    prisma.equipmentItem.findMany({ select: { id: true, slug: true, name: true, type: true, category: true, costGp: true, weightLb: true, damageFormula: true, damageType: true, properties: true, masteryPropertyId: true, armorCategory: true, armorClass: true, dexterityBonusMax: true, shieldBonus: true }, orderBy: { name: "asc" } }), 
    prisma.language.findMany({ orderBy: [{ isExotic: "asc" }, { name: "asc" }] }), 
    prisma.classFeature.findMany({ where: { level: 1 }, select: { id: true, dndClassId: true, name: true, description: true }, orderBy: { name: "asc" } })
  ]);
  return { species, backgrounds, classes, spells, skills, weaponMasteries, equipment, languages, classFeatures };
}

export async function getSkillDefinitions() {
  return prisma.skillDefinition.findMany({ orderBy: { name: "asc" } });
}

export async function getCharacterById(characterId: string, userId: string) {
  const character = await prisma.character.findFirst({
    where: { id: characterId, userId },
    include: { notebooks: { orderBy: { updatedAt: "desc" }, include: { attachments: true } }, campaignLinks: { include: { campaign: { select: { id: true, title: true } } } }, spells: { include: { spell: true } }, inventoryItems: { include: { item: true } }, dndClass: { include: { classFeatures: { where: { level: { lte: 20 } }, orderBy: [{ level: "asc" }, { name: "asc" }] } } }, dndSubclass: { select: { id: true, name: true, description: true } }, resources: true, languages: { include: { language: true } }, background: { include: { originFeat: true } } },
  });
  if (!character) return null;

  const selectedFeats = Array.isArray(character.selectedFeats) ? character.selectedFeats : [];
  const rawImportData = character.rawImportData ?? null;
  const selectedFeatNames = selectedFeats.map((entry) => (typeof entry === "string" ? entry : (entry as any)?.name)).filter((entry): entry is string => typeof entry === "string");
  const levelUpFeats = selectedFeatNames.length ? await prisma.feats.findMany({ where: { name: { in: selectedFeatNames } } }) : [];
  const spells = character.spells.map(({ spell }) => ({ ...spell }));

  return { ...character, selectedFeats, rawImportData, spells, levelUpFeats };
}

export async function toggleCharacterInventoryEquipped(userId: string, characterId: string, inventoryItemId: string) {
  const character = await prisma.character.findFirst({ where: { id: characterId, userId }, select: { id: true, dexterity: true } });
  if (!character) throw new Error("Character not found");
  const inventoryItem = await prisma.characterInventory.findFirst({ where: { id: inventoryItemId, characterId }, include: { item: true } });
  if (!inventoryItem) throw new Error("Inventory item not found");
  if (inventoryItem.item.type !== "ARMOR" && inventoryItem.item.type !== "SHIELD") throw new Error("Seuls les armures et boucliers peuvent être équipés.");
  const nextEquipped = !inventoryItem.isEquipped;
  await prisma.$transaction(async (tx) => {
    if (nextEquipped) await tx.characterInventory.updateMany({ where: { characterId, isEquipped: true, item: { type: inventoryItem.item.type } }, data: { isEquipped: false } });
    await tx.characterInventory.update({ where: { id: inventoryItemId }, data: { isEquipped: nextEquipped } });
  });
  const equippedItems = await prisma.characterInventory.findMany({ where: { characterId, isEquipped: true }, include: { item: true } });
  const armor = equippedItems.find((entry) => entry.item.type === "ARMOR");
  const shield = equippedItems.find((entry) => entry.item.type === "SHIELD");
  const armorClass = calculateArmorClass({ dexterityModifier: calculateModifier(character.dexterity), armorCategory: (armor?.item.armorCategory ?? "NONE") as "NONE" | "LIGHT" | "MEDIUM" | "HEAVY", armorBaseClass: armor?.item.armorClass ?? undefined, armorDexCap: armor?.item.dexterityBonusMax, shieldBonus: shield?.item.shieldBonus ?? 0 });
  return prisma.character.update({ where: { id: characterId }, data: { armorClass } });
}

export async function deleteCharacter(characterId: string, userId: string) {
  const character = await prisma.character.findFirst({ where: { id: characterId, userId }, select: { avatarUrl: true } });
  if (!character) return { count: 0 };
  await deleteStorageObject(character.avatarUrl);
  return prisma.character.deleteMany({ where: { id: characterId, userId } });
}

export async function replaceCharacterAvatar(characterId: string, userId: string, avatarUrl: string) {
  const character = await prisma.character.findFirst({ where: { id: characterId, userId }, select: { avatarUrl: true } });
  if (!character) throw new Error("Character not found");
  await deleteStorageObject(character.avatarUrl);
  return prisma.character.update({ where: { id: characterId }, data: { avatarUrl } });
}

export async function updateCharacterTheme(userId: string, characterId: string, data: { themeKey?: string; notebookTheme?: string }) {
  const character = await prisma.character.findFirst({ where: { id: characterId, userId }, select: { id: true } });
  if (!character) throw new Error("Character not found");
  return prisma.character.update({ where: { id: characterId }, data });
}