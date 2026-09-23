"use server";

import { prisma } from "@/lib/prisma";
import { Prisma, ArmorCategory } from "@prisma/client";
import { CharacterCreateSchema, CharacterSheetUpdateSchema } from "@/modules/characters/schemas";
import { calculateArmorClass, calculateModifier } from "@/modules/characters/engine/dnd-rules-engine";
import { deleteStorageObject } from "@/lib/storage";

export async function fetchAvailableFeats() {
  try {
    const feats = await prisma.feat.findMany({ 
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
  const spellIds = Array.isArray((data as { spellIds?: unknown } | null | undefined)?.spellIds) 
    ? (data as { spellIds: unknown[] }).spellIds.filter((value): value is string => typeof value === "string" && value.length > 0) 
    : (input.selectedSpellIds ?? []);
  const { selectedSpellIds, selectedWeaponMasteryIds, selectedLanguageIds, startingEquipmentIds, ...characterInput } = input;
  const resolvedSpellIds = spellIds.length ? spellIds : (selectedSpellIds ?? []);
  
  if (resolvedSpellIds.length && input.dndClassId) {
    const dndClass = await prisma.dndClass.findUnique({ where: { id: input.dndClassId }, select: { slug: true, name: true } });
    const spells = await prisma.spell.findMany({ where: { id: { in: resolvedSpellIds } }, select: { id: true, level: true, classes: true } });
    if (!dndClass || spells.length !== new Set(resolvedSpellIds).size || spells.some((spell) => Array.isArray(spell.classes) && spell.classes.length > 0 && !spell.classes.includes(dndClass.slug))) {
      throw new Error("Sélection de sorts invalide pour cette classe.");
    }
    const cantrips = spells.filter((spell) => spell.level === 0).length;
    const levelOne = spells.filter((spell) => spell.level === 1).length;
    const quotas = dndClass.slug === "wizard" ? [3, 6] : dndClass.slug === "cleric" || dndClass.slug === "druid" ? [3, Math.max(1, calculateModifier(input.wisdom ?? 10) + 1)] : dndClass.slug === "sorcerer" ? [4, 2] : dndClass.slug === "warlock" ? [2, 2] : [2, 4];
    if (cantrips !== quotas[0] || levelOne !== quotas[1]) {
      throw new Error(`La sélection doit contenir ${quotas[0]} tours de magie et ${quotas[1]} sorts de niveau 1.`);
    }
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
      spells: resolvedSpellIds.length ? { 
        create: resolvedSpellIds.map((spellId) => ({ 
          spell: { connect: { id: spellId } }, 
          prepared: true, 
          learned: true 
         })) 
      } : undefined, 
      weaponMasteries: selectedWeaponMasteryIds?.length ? { create: selectedWeaponMasteryIds.map((masteryId) => ({ masteryId })) } : undefined, 
      languages: selectedLanguageIds?.length ? { create: selectedLanguageIds.map((languageId) => ({ languageId })) } : undefined, 
      inventory: startingEquipmentIds?.length ? { 
        create: startingEquipmentIds.map((equipmentId) => ({ 
          equipment: { connect: { id: equipmentId } }, 
          quantity: 1, 
          equipped: false,
          isAttuned: false,
        })) 
      } : undefined, 
      resources: resourceTrackers.length ? { create: resourceTrackers } : undefined 
    },
  });
}

export async function updateCharacter(userId: string, characterId: string, data: unknown) {
  const rawData = data as any; 
  const input = CharacterSheetUpdateSchema.parse(data);
  const character = await prisma.character.findFirst({ where: { id: characterId, userId } });
  if (!character) throw new Error("Character not found");

  const currentInventory = await prisma.characterInventoryItem.findMany({ 
    where: { characterId }, 
    include: { equipment: true } 
  });
  const currentInventoryById = new Map(currentInventory.map((entry) => [entry.id, entry]));
  
  const incomingInventory = rawData.inventoryItems ?? rawData.inventory ?? [];
  const incomingInventoryIds = new Set(incomingInventory.map((entry: any) => entry.id));

  return prisma.$transaction(async (transaction) => {
    const itemsToDelete = currentInventory.filter((entry) => !incomingInventoryIds.has(entry.id)).map((entry) => entry.id);
    if (itemsToDelete.length) {
      await transaction.characterInventoryItem.deleteMany({ where: { characterId, id: { in: itemsToDelete } } });
    }

    for (const inventoryItem of incomingInventory) {
      const currentEntry = currentInventoryById.get(inventoryItem.id);
      const incomingItem = inventoryItem.item ?? inventoryItem.equipment;
      const isTemporary = !inventoryItem.id || inventoryItem.id.startsWith("temp-") || !currentEntry;
      
      const isAttunedValue = Boolean(inventoryItem.isAttuned ?? inventoryItem.attuned ?? incomingItem?.attuned ?? false);

      if (isTemporary) {
        let equipmentId: string | null = null;
        if (incomingItem?.id && !incomingItem.id.startsWith("temp-")) {
          const matched = await transaction.equipmentItem.findUnique({ where: { id: incomingItem.id }, select: { id: true } });
          equipmentId = matched?.id ?? null;
        }

        await transaction.characterInventoryItem.create({
          data: {
            characterId,
            equipmentId,
            customName: equipmentId ? null : (incomingItem?.name || inventoryItem.name || "Objet sans nom"),
            quantity: inventoryItem.quantity ?? 1,
            equipped: inventoryItem.equipped ?? inventoryItem.isEquipped ?? false,
            isAttuned: isAttunedValue,
            notes: incomingItem?.description ?? inventoryItem.notes ?? null,
          },
        });
        continue;
      }

      if (currentEntry) {
        await transaction.characterInventoryItem.update({
          where: { id: currentEntry.id },
          data: { 
            quantity: inventoryItem.quantity ?? currentEntry.quantity, 
            equipped: inventoryItem.equipped !== undefined ? inventoryItem.equipped : (inventoryItem.isEquipped !== undefined ? inventoryItem.isEquipped : currentEntry.equipped),
            isAttuned: isAttunedValue,
            notes: inventoryItem.notes !== undefined ? inventoryItem.notes : currentEntry.notes,
          },
        });
      }
    }

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
        spellSlots: (input as any).spellSlots !== undefined 
          ? ((input as any).spellSlots as Prisma.InputJsonValue) 
          : (character.spellSlots as Prisma.InputJsonValue),
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
    include: { 
      notebooks: { orderBy: { updatedAt: "desc" }, include: { attachments: true } }, 
      campaignLinks: { include: { campaign: { select: { id: true, title: true } } } }, 
      spells: { include: { spell: true } }, 
      inventory: { include: { equipment: true } }, 
      dndClass: { include: { classFeatures: { where: { level: { lte: 20 } }, orderBy: [{ level: "asc" }, { name: "asc" }] } } }, 
      dndSubclass: { select: { id: true, name: true, description: true } }, 
      resources: true, 
      languages: { include: { language: true } }, 
      background: { include: { originFeat: true } } 
    },
  });
  if (!character) return null;

  const selectedFeats = Array.isArray(character.selectedFeats) ? character.selectedFeats : [];
  const rawImportData = character.rawImportData ?? null;
  const selectedFeatNames = selectedFeats.map((entry) => (typeof entry === "string" ? entry : (entry as any)?.name)).filter((entry): entry is string => typeof entry === "string");
  
  const levelUpFeats = selectedFeatNames.length ? await prisma.feat.findMany({ where: { name: { in: selectedFeatNames } } }) : [];
  
  const spells = character.spells.map(({ spell }) => ({ ...spell }));

  const inventoryItems = character.inventory.map((inv) => {
    const equipmentType = inv.equipment?.type;
    const customName = inv.customName ?? "";
    
    // Normalisation intelligente du type à la source (détection par nom si custom)
    let resolvedType = "GEAR";
    if (equipmentType) {
      resolvedType = equipmentType.toUpperCase();
    } else {
      const lowerName = customName.toLowerCase();
      if (
        lowerName.includes("axe") || 
        lowerName.includes("sword") || 
        lowerName.includes("bow") || 
        lowerName.includes("dagger") || 
        lowerName.includes("hammer") || 
        lowerName.includes("mace") || 
        lowerName.includes("staff") || 
        lowerName.includes("blade") ||
        lowerName.includes("spear") ||
        lowerName.includes("halberd") ||
        lowerName.includes("glaive") ||
        lowerName.includes("greataxe")
      ) {
        resolvedType = "WEAPON";
      } else if (lowerName.includes("armor") || lowerName.includes("mail") || lowerName.includes("plate") || lowerName.includes("cuirass") || lowerName.includes("armure")) {
        resolvedType = "ARMOR";
      } else if (lowerName.includes("shield") || lowerName.includes("bouclier")) {
        resolvedType = "SHIELD";
      } else if (lowerName.includes("potion") || lowerName.includes("scroll") || lowerName.includes("parchemin")) {
        resolvedType = "CONSUMABLE";
      } else if (lowerName.includes("ring") || lowerName.includes("amulet") || lowerName.includes("necklace") || lowerName.includes("cloak") || lowerName.includes("+1") || lowerName.includes("+2") || lowerName.includes("+3")) {
        resolvedType = "MAGIC_ITEM";
      }
    }

    if (resolvedType === "WEOAPON") resolvedType = "WEAPON";

    return {
      id: inv.id,
      characterId: inv.characterId,
      itemId: inv.equipmentId ?? inv.id,
      quantity: inv.quantity,
      isEquipped: inv.equipped,
      isAttuned: inv.isAttuned,
      item: inv.equipment ? {
        ...inv.equipment,
        type: resolvedType,
        attuned: inv.isAttuned,
      } : {
        id: inv.id,
        slug: `custom-${inv.id}`,
        name: customName || "Objet sans nom",
        category: resolvedType === "WEAPON" ? "Arme" : resolvedType === "ARMOR" ? "Armure" : "gear",
        description: inv.notes ?? "",
        type: resolvedType,
        costGp: 0,
        weightLb: 0,
        armorClass: null,
        properties: [],
        attuned: inv.isAttuned,
      },
    };
  });

  return { ...character, selectedFeats, rawImportData, spells, levelUpFeats, inventoryItems };
}

export async function toggleCharacterInventoryEquipped(userId: string, characterId: string, inventoryItemId: string) {
  const character = await prisma.character.findFirst({ where: { id: characterId, userId }, select: { id: true, dexterity: true } });
  if (!character) throw new Error("Character not found");

  const inventoryItem = await prisma.characterInventoryItem.findFirst({ 
    where: { id: inventoryItemId, characterId }, 
    include: { equipment: true } 
  });
  if (!inventoryItem) throw new Error("Inventory item not found");

  // Détermination robuste du type (qu'il vienne de equipment ou qu'il soit personnalisé/déduit)
  let itemType = (inventoryItem.equipment?.type ?? "").toUpperCase();
  
  if (!itemType) {
    const name = (inventoryItem.customName ?? "").toLowerCase();
    if (name.includes("axe") || name.includes("sword") || name.includes("bow") || name.includes("dagger") || name.includes("hammer") || name.includes("mace") || name.includes("staff") || name.includes("blade") || name.includes("spear") || name.includes("greataxe")) {
      itemType = "WEAPON";
    } else if (name.includes("armor") || name.includes("mail") || name.includes("plate") || name.includes("armure")) {
      itemType = "ARMOR";
    } else if (name.includes("shield") || name.includes("bouclier")) {
      itemType = "SHIELD";
    } else {
      itemType = "GEAR"; // Par défaut si c'est de l'équipement général
    }
  }

  // On autorise maintenant les armes, armures et boucliers (et on laisse passer le GEAR si l'utilisateur veut l'équiper)
  const nextEquipped = !inventoryItem.equipped;

  await prisma.$transaction(async (tx) => {
    if (nextEquipped && (itemType === "ARMOR" || itemType === "SHIELD")) {
      // Optionnel : Gérer l'exclusivité d'armure/bouclier si besoin
    }
    await tx.characterInventoryItem.update({ 
      where: { id: inventoryItemId }, 
      data: { equipped: nextEquipped } 
    });
  });

  const equippedItems = await prisma.characterInventoryItem.findMany({ 
    where: { characterId, equipped: true }, 
    include: { equipment: true } 
  });

  const armor = equippedItems.find((entry) => (entry.equipment?.type ?? "").toUpperCase() === "ARMOR");
  const shield = equippedItems.find((entry) => (entry.equipment?.type ?? "").toUpperCase() === "SHIELD");

  const armorCategory = (armor?.equipment?.armorCategory ?? "NONE") as ArmorCategory;
  const armorBaseClass = armor?.equipment?.armorClass ?? 10;
  const armorDexCap = armor?.equipment?.dexterityBonusMax ?? null;
  const shieldBonus = shield?.equipment?.shieldBonus ?? 0;

  const armorClass = calculateArmorClass({ 
    dexterityModifier: calculateModifier(character.dexterity), 
    armorCategory: armorCategory as "NONE" | "LIGHT" | "MEDIUM" | "HEAVY", 
    armorBaseClass: armorBaseClass, 
    armorDexCap: armorDexCap ?? undefined, 
    shieldBonus 
  });

  return prisma.character.update({ 
    where: { id: characterId }, 
    data: { 
      armorClass,
      armorCategory,
      armorBaseClass,
      armorDexCap,
      shieldBonus
    } 
  });
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