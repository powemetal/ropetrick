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

  const [strength, dexterity, constitution, intelligence, wisdom, charisma] = [
    getScore("str"),
    getScore("dex"),
    getScore("con"),
    getScore("int"),
    getScore("wis"),
    getScore("cha"),
  ];

  return prisma.$transaction(async (tx) => {
    // 1. Résolution des sorts (Batch find + création automatique si absent)
    const spellNames = Array.from(
      new Set(parsed.extractedSpells.map((s) => s.name.trim()))
    );

    const existingSpells = await tx.spell.findMany({
      where: {
        name: { in: spellNames, mode: "insensitive" },
      },
      select: { id: true, name: true },
    });

    const spellMap = new Map<string, string>();
    for (const s of existingSpells) {
      spellMap.set(s.name.toLowerCase(), s.id);
    }

    const spellsToCreate: Prisma.CharacterSpellCreateWithoutCharacterInput[] = [];
    const seenSpellIds = new Set<string>();

    for (const s of parsed.extractedSpells) {
      const cleanName = s.name.trim();
      let spellId = spellMap.get(cleanName.toLowerCase());

      if (!spellId) {
        const createdSpell = await tx.spell.create({
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
            ritual: s.ritual,
            description: s.description || "Sort importé de Foundry VTT.",
            source: "Foundry Import",
          },
          select: { id: true },
        });
        spellId = createdSpell.id;
        spellMap.set(cleanName.toLowerCase(), spellId);
      }

      if (!seenSpellIds.has(spellId)) {
        seenSpellIds.add(spellId);
        spellsToCreate.push({
          spell: { connect: { id: spellId } },
          prepared: s.prepared,
          learned: true,
        });
      }
    }

    // 2. Résolution des items d'inventaire avec liaison sur le catalogue global d'équipements
    const itemNames = Array.from(
      new Set(parsed.extractedItems.map((i) => i.name.trim()))
    );

    const existingEquipment = await tx.equipmentItem.findMany({
      where: {
        name: { in: itemNames, mode: "insensitive" },
      },
      select: { id: true, name: true },
    });

    const equipmentMap = new Map<string, string>();
    for (const eq of existingEquipment) {
      equipmentMap.set(eq.name.toLowerCase(), eq.id);
    }

    const inventoryToCreate: Prisma.CharacterInventoryItemCreateWithoutCharacterInput[] =
      parsed.extractedItems.map((invItem: any) => {
        const cleanName = invItem.name.trim();
        const equipmentId = equipmentMap.get(cleanName.toLowerCase()) ?? null;

        // Détection robuste de l'état d'harmonisation (attunement) depuis les données extraites
        const isAttunedValue = Boolean(
          invItem.attuned || 
          invItem.isAttuned || 
          invItem.system?.attuned || 
          false
        );

        return {
          equipment: equipmentId ? { connect: { id: equipmentId } } : undefined,
          customName: equipmentId ? null : cleanName,
          quantity: invItem.quantity ?? 1,
          equipped: invItem.equipped ?? false,
          isAttuned: isAttunedValue, // <--- Enregistre l'harmonisation dès l'import initial
          notes: invItem.description ? invItem.description.slice(0, 1000) : null,
        };
      });

    // 3. Formatage des dons / traits
    const formattedFeats = parsed.extractedFeats
      .map((feat) => ({
        name: feat.name ?? "Inconnu",
        description: feat.description ?? "",
        requirements: feat.requirements ?? null,
        featureType: feat.featureType ?? "feat",
        usesValue: feat.usesValue,
        usesMax: feat.usesMax,
      }))
      .filter((feat) => feat.featureType !== "class");

    const hpData = parsed.stats.hitPoints as { current?: number; max?: number; temp?: number } | undefined;

    // 4. Création atomique du personnage
    return tx.character.create({
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

        // Monnaies
        copperPieces: parsed.currency.cp,
        silverPieces: parsed.currency.sp,
        electrumPieces: parsed.currency.ep,
        goldPieces: parsed.currency.gp,
        platinumPieces: parsed.currency.pp,

        // Caractéristiques & Modificateurs
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

        // Points de vie & Combat
        currentHitPoints: hpData?.current ?? 10,
        maxHitPoints: hpData?.max ?? 10,
        temporaryHitPoints: hpData?.temp ?? 0,
        armorClass: (parsed.stats.armorClass as number) ?? 10,

        // Dons
        selectedFeats: formattedFeats as Prisma.InputJsonValue,

        // Relations
        spells: spellsToCreate.length > 0 ? { create: spellsToCreate } : undefined,
        inventory: inventoryToCreate.length > 0 ? { create: inventoryToCreate } : undefined,
      },
    });
  });
}