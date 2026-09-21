"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { CharacterLevelUpSchema } from "@/modules/characters/schemas";
import { calculateModifier } from "@/modules/characters/engine/dnd-rules-engine";
import { maxSpellLevelForProgression, spellSelectionCountForClass, validateLevelUpChoices } from "@/modules/characters/engine/class-progression-rules";

export async function levelUpCharacter(userId: string, characterId: string, data: unknown) {
  const input = CharacterLevelUpSchema.parse(data);
  const character = await prisma.character.findFirst({
    where: { id: characterId, userId },
    select: {
      level: true, class: true, subclass: true, subclassId: true,
      dndClass: { select: { id: true, slug: true, spellcastingProgression: true } },
      hitDie: true, constitution: true, maxHitPoints: true, currentHitPoints: true,
      strength: true, dexterity: true, intelligence: true, wisdom: true, charisma: true,
      selectedFeats: true, spells: { select: { spellId: true } },
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