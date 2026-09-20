"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { CharacterCreateSchema } from "@/modules/characters/schemas";
import { CharacterLevelUpSchema, CharacterSheetUpdateSchema } from "@/modules/characters/schemas";
import { parseFoundryActor } from "@/modules/characters/server/foundry-importer";
import { calculateArmorClass, calculateModifier } from "@/modules/characters/engine/dnd-rules-engine";
import { maxSpellLevelForProgression, spellSelectionCountForClass, validateLevelUpChoices } from "@/modules/characters/engine/class-progression-rules";
import { deleteStorageObject } from "@/lib/storage";

const FALLBACK_FEATS = [
  { id: "fallback-alert", name: "Alerte", description: "Vous restez toujours aux aguets et ne pouvez pas être surpris si vous êtes conscient.", prerequisite: null },
  { id: "fallback-charger", name: "Chargeur", description: "Vous pouvez vous déplacer rapidement et frapper avec élan.", prerequisite: null },
  { id: "fallback-crossbow-expert", name: "Expert des arbalètes", description: "Vous maîtrisez les arbalètes de guerre et de poing.", prerequisite: null },
  { id: "fallback-defensive-duelist", name: "Duelliste défensif", description: "Vous pouvez améliorer votre défense avec une arme de finesse.", prerequisite: null },
  { id: "fallback-lucky", name: "Chanceux", description: "Vous disposez de points de chance pour relancer des jets cruciaux.", prerequisite: null },
  { id: "fallback-mage-slayer", name: "Pourfendeur de mage", description: "Vous gênez les lanceurs de sorts à courte portée.", prerequisite: null },
  { id: "fallback-polearm-master", name: "Maître d'hast", description: "Vous tirez parti des armes d'hast pour attaquer et contrôler l'espace.", prerequisite: null },
  { id: "fallback-resilient", name: "Résilient", description: "Vous gagnez en robustesse dans une caractéristique choisie.", prerequisite: null },
  { id: "fallback-sentinel", name: "Sentinelle", description: "Vous stoppez les ennemis qui tentent de passer au travers de votre zone.", prerequisite: null },
  { id: "fallback-sharpshooter", name: "Tireur d'élite", description: "Vous excellez dans les tirs lointains et précis.", prerequisite: null },
];

export async function fetchAvailableFeats() {
  const feats = await prisma.feat.findMany({ select: { id: true, name: true, description: true, prerequisite: true }, orderBy: { name: "asc" } });
  return feats.length ? feats : FALLBACK_FEATS;
}

export async function fetchAvailableLevelUpSpells() {
  const spells = await prisma.spell.findMany({
    select: { id: true, name: true, level: true, school: true, range: true, castingTime: true, description: true, classes: true },
    orderBy: [{ level: "asc" }, { name: "asc" }],
  });
  return spells.map((spell) => ({
    id: spell.id,
    name: spell.name,
    level: spell.level,
    school: spell.school,
    range: spell.range,
    castingTime: spell.castingTime,
    description: spell.description,
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
  const resourceTrackers =
    selectedClassRecord?.resourceDefinitions.map((definition) => {
      const formula = definition.formulaByLevel;
      const values = formula && typeof formula === "object" && !Array.isArray(formula) ? (formula as Record<string, unknown>) : {};
      const maxValue = Number(values["1"] ?? 0);
      return { name: definition.name, currentValue: maxValue, maxValue, diceFormula: definition.diceFormula, resetCondition: definition.resetCondition };
    }) ?? [];
  return prisma.character.create({
    data: { ...characterInput, maxHitPoints, currentHitPoints: input.currentHitPoints ?? maxHitPoints, constitutionMod: constitutionModifier, stats: input.stats as Prisma.InputJsonValue, userId, spells: resolvedSpellIds.length ? { create: resolvedSpellIds.map((spellId) => ({ spellId, prepared: true, learned: true })) } : undefined, weaponMasteries: selectedWeaponMasteryIds?.length ? { create: selectedWeaponMasteryIds.map((masteryId) => ({ masteryId })) } : undefined, languages: selectedLanguageIds?.length ? { create: selectedLanguageIds.map((languageId) => ({ languageId })) } : undefined, inventoryItems: startingEquipmentIds?.length ? { create: startingEquipmentIds.map((itemId) => ({ itemId, quantity: 1, isEquipped: false })) } : undefined, resources: resourceTrackers.length ? { create: resourceTrackers } : undefined },
  });
}

export async function updateCharacter(userId: string, characterId: string, data: unknown) {
  const input = CharacterSheetUpdateSchema.parse(data);
  const character = await prisma.character.findFirst({ where: { id: characterId, userId }, select: { id: true } });
  if (!character) throw new Error("Character not found");

  const currentInventory = await prisma.characterInventory.findMany({
    where: { characterId },
    include: { item: true },
  });
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
          data: {
            characterId,
            itemId: newItem.id,
            quantity: inventoryItem.quantity,
            isEquipped: false,
          },
        });
        continue;
      }

      if (currentEntry) {
        await transaction.characterInventory.update({
          where: { id: currentEntry.id },
          data: {
            quantity: inventoryItem.quantity,
            isEquipped: inventoryItem.isEquipped,
          },
        });
      }
    }

    return transaction.character.update({
      where: { id: characterId },
      data: {
        name: input.name,
        class: input.class,
        subclass: input.subclass,
        strength: input.strength,
        dexterity: input.dexterity,
        constitution: input.constitution,
        intelligence: input.intelligence,
        wisdom: input.wisdom,
        charisma: input.charisma,
        strengthMod: calculateModifier(input.strength),
        dexterityMod: calculateModifier(input.dexterity),
        constitutionMod: calculateModifier(input.constitution),
        intelligenceMod: calculateModifier(input.intelligence),
        wisdomMod: calculateModifier(input.wisdom),
        charismaMod: calculateModifier(input.charisma),
        skillProficiencies: input.skillProficiencies,
        themeKey: input.themeKey,
        notebookTheme: (input as any).notebookTheme,
        copperPieces: input.copperPieces,
        silverPieces: input.silverPieces,
        electrumPieces: input.electrumPieces,
        goldPieces: input.goldPieces,
        platinumPieces: input.platinumPieces,
        personalityTraits: input.personalityTraits,
        ideals: input.ideals,
        bonds: input.bonds,
        flaws: input.flaws,
        appearance: input.appearance,
        backstory: input.backstory,
        alliesOrganizations: input.alliesOrganizations,
      },
    });
  });
}

export async function levelUpCharacter(userId: string, characterId: string, data: unknown) {
  const input = CharacterLevelUpSchema.parse(data);
  const character = await prisma.character.findFirst({
    where: { id: characterId, userId },
    select: {
      level: true,
      class: true,
      subclass: true,
      subclassId: true,
      dndClass: { select: { id: true, slug: true, spellcastingProgression: true } },
      hitDie: true,
      constitution: true,
      maxHitPoints: true,
      currentHitPoints: true,
      strength: true,
      dexterity: true,
      intelligence: true,
      wisdom: true,
      charisma: true,
      selectedFeats: true,
      spells: { select: { spellId: true } },
    },
  });
  if (!character) throw new Error("Character not found");
  const validation = validateLevelUpChoices(character.class, character.level, { ...input, hasSubclass: Boolean(character.subclassId || character.subclass) });
  if (!validation.valid) throw new Error(validation.errors.join(" "));

  const constitutionModifier = calculateModifier(character.constitution);
  const hitDie = character.hitDie as 6 | 8 | 10 | 12;
  const nextLevel = character.level + 1;
  const hitPointGain = (input.hitPointMethod === "ROLL" ? Math.floor(Math.random() * hitDie) + 1 : Math.ceil((hitDie + 1) / 2)) + constitutionModifier;
  const abilityIncrease = input.abilityIncrease ?? {};
  const abilityNames = ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"] as const;
  const increaseTotal = abilityNames.reduce((total, ability) => total + (abilityIncrease[ability] ?? 0), 0);
  if (increaseTotal > 0 && ![4, 8, 12, 16, 19].includes(nextLevel)) throw new Error("Ability increases are not available at this level");
  if (increaseTotal > 2) throw new Error("An ability increase cannot exceed two points");
  const nextScores = Object.fromEntries(abilityNames.map((ability) => [ability, character[ability] + (abilityIncrease[ability] ?? 0)])) as Record<(typeof abilityNames)[number], number>;
  const nextFeats = input.feat ? [...(Array.isArray(character.selectedFeats) ? character.selectedFeats : []), input.feat] : character.selectedFeats;

  const existingSpellIds = new Set((character.spells ?? []).map((s) => s.spellId));
  const selectedSpellIds = (input.spellIds ?? []).filter((spellId) => spellId.trim() && !existingSpellIds.has(spellId));

  if (selectedSpellIds.length > 0) {
    if (!character.dndClass?.slug) throw new Error("Sélection de sorts invalide pour cette classe.");
    const expectedSpellCount = spellSelectionCountForClass(character.class);
    if (selectedSpellIds.length !== expectedSpellCount) throw new Error(`Sélectionnez exactement ${expectedSpellCount} sort${expectedSpellCount > 1 ? "s" : ""}.`);

    const selectedSpells = await prisma.spell.findMany({ where: { id: { in: selectedSpellIds } }, select: { id: true, level: true, classes: true } });
    if (selectedSpells.length !== new Set(selectedSpellIds).size || selectedSpells.some((spell) => Array.isArray(spell.classes) && spell.classes.length > 0 && !spell.classes.includes(character.dndClass!.slug))) {
      throw new Error("Sélection de sorts invalide pour cette classe.");
    }

    const maxSpellLevel = maxSpellLevelForProgression(nextLevel, character.dndClass.spellcastingProgression);
    if (selectedSpells.some((spell) => spell.level > maxSpellLevel)) throw new Error("Un sort sélectionné dépasse le niveau de sort disponible pour cette montée de niveau.");
  }

  const subclass = input.subclassId ? await prisma.dndSubclass.findFirst({ where: { id: input.subclassId, dndClassId: character.dndClass?.id ?? undefined }, select: { name: true } }) : null;
  if (input.subclassId && !subclass) throw new Error("Sous-classe invalide pour cette classe.");

  if (character.dndClass?.id) {
    await prisma.classFeature.findMany({ where: { dndClassId: character.dndClass.id, level: nextLevel }, select: { id: true } });
  }
  if (character.subclassId || input.subclassId) {
    await prisma.classFeature.findMany({ where: { dndSubclassId: input.subclassId ?? character.subclassId ?? undefined, level: nextLevel }, select: { id: true } });
  }

  return prisma.character.update({
    where: { id: characterId },
    data: {
      level: nextLevel,
      maxHitPoints: character.maxHitPoints + hitPointGain,
      currentHitPoints: character.currentHitPoints + hitPointGain,
      hitDiceTotal: { increment: 1 },
      hitDiceCurrent: { increment: 1 },
      ...nextScores,
      strengthMod: calculateModifier(nextScores.strength),
      dexterityMod: calculateModifier(nextScores.dexterity),
      constitutionMod: calculateModifier(nextScores.constitution),
      intelligenceMod: calculateModifier(nextScores.intelligence),
      wisdomMod: calculateModifier(nextScores.wisdom),
      charismaMod: calculateModifier(nextScores.charisma),
      selectedFeats: nextFeats as Prisma.InputJsonValue,
      ...(input.subclassId ? { subclassId: input.subclassId, subclass: subclass?.name ?? character.subclass } : {}),
      ...(selectedSpellIds.length ? { spells: { createMany: { data: selectedSpellIds.map((spellId) => ({ spellId, prepared: true, learned: true })) } } } : {}),
    },
  });
}

// Redirige correctement vers la logique complète d'importation
export async function importFoundryCharacter(userId: string, rawJson: unknown) {
  return createCharacterFromFoundry(userId, rawJson);
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
  const [species, backgrounds, classes, spells, skills, weaponMasteries, equipment, languages, classFeatures] = await Promise.all([getSpeciesCompendium(), prisma.background.findMany({ select: { id: true, slug: true, name: true, abilityChoices: true, originFeat: { select: { id: true, name: true, description: true } }, skillProficiencies: true }, orderBy: { name: "asc" } }), prisma.dndClass.findMany({ select: { id: true, slug: true, name: true, hitDie: true, skillChoices: true, skillOptions: true, subclasses: { select: { id: true, slug: true, name: true }, orderBy: { name: "asc" } } }, orderBy: { name: "asc" } }), prisma.spell.findMany({ where: { level: { in: [0, 1] } }, orderBy: [{ level: "asc" }, { name: "asc" }] }), prisma.skillDefinition.findMany({ orderBy: { name: "asc" } }), prisma.weaponMasteryProperty.findMany({ orderBy: { name: "asc" } }), prisma.equipmentItem.findMany({ select: { id: true, slug: true, name: true, type: true, category: true, costGp: true, weightLb: true, damageFormula: true, damageType: true, properties: true, masteryPropertyId: true, armorCategory: true, armorClass: true, dexterityBonusMax: true, shieldBonus: true }, orderBy: { name: "asc" } }), prisma.language.findMany({ orderBy: [{ isExotic: "asc" }, { name: "asc" }] }), prisma.classFeature.findMany({ where: { level: 1 }, select: { id: true, dndClassId: true, name: true, description: true }, orderBy: { name: "asc" } })]);
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
  const selectedFeatNames = Array.isArray(character.selectedFeats) ? character.selectedFeats.filter((entry): entry is string => typeof entry === "string") : [];
  const levelUpFeats = selectedFeatNames.length ? await prisma.feat.findMany({ where: { name: { in: selectedFeatNames } } }) : [];
  const spells = character.spells.map(({ spell }) => ({ ...spell }));
  return { ...character, spells, levelUpFeats };
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

export async function createCharacterFromFoundry(userId: string, rawJson: unknown) {
  const parsed = parseFoundryActor(rawJson);

  const abilities = (parsed.stats.abilities as Record<string, any>) || {};
  const getScore = (key: string) => abilities[key]?.value ?? 10;
  const getMod = (score: number) => Math.floor((score - 10) / 2);

  const [strength, dexterity, constitution, intelligence, wisdom, charisma] = [
    getScore("str"), getScore("dex"), getScore("con"),
    getScore("int"), getScore("wis"), getScore("cha")
  ];

  // Gestion des sorts avec unicité garantie pour éviter les conflits Prisma
  const spellConnectionsMap = new Map<string, { spellId: string; prepared: boolean; learned: boolean }>();

  for (const s of parsed.extractedSpells) {
    const cleanName = s.name.trim();
    let spell = await prisma.spell.findFirst({
      where: { name: { equals: cleanName, mode: "insensitive" } },
      select: { id: true },
    });

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

  return prisma.character.create({
    data: {
      userId,
      name: parsed.name,
      avatarUrl: parsed.avatarUrl,
      race: parsed.race,
      class: parsed.class,
      subclass: parsed.subclass,
      level: parsed.level,
      foundryActorId: parsed.foundryActorId,
      foundryVersion: parsed.foundryVersion,
      rawImportData: parsed.rawImportData,
      stats: parsed.stats,
      themeKey: "warrior",
      notebookTheme: "parchment",
      strength, dexterity, constitution, intelligence, wisdom, charisma,
      strengthMod: getMod(strength),
      dexterityMod: getMod(dexterity),
      constitutionMod: getMod(constitution),
      intelligenceMod: getMod(intelligence),
      wisdomMod: getMod(wisdom),
      charismaMod: getMod(charisma),
      currentHitPoints: (parsed.stats.hitPoints as any)?.current ?? 10,
      maxHitPoints: (parsed.stats.hitPoints as any)?.max ?? 10,
      armorClass: (parsed.stats.armorClass as number) ?? 10,
      spells: spellConnectionsMap.size > 0 ? { create: Array.from(spellConnectionsMap.values()) } : undefined,
    },
  });
}