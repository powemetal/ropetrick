"use server";

import { ArmorCategory, CreatureSize, ItemType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdminAccess } from "@/modules/users/server/admin-service";

export async function getAdminCompendiumData() {
  await requireAdminAccess();
  const [spells, items, feats, monsters, classFeatures, classes, subclasses, sourceBooks, masteries] = await Promise.all([
    prisma.spell.findMany({ include: { sourceBook: true }, orderBy: [{ level: "asc" }, { name: "asc" }] }),
    prisma.equipmentItem.findMany({ include: { sourceBook: true, masteryProperty: true }, orderBy: { name: "asc" } }),
    prisma.feat.findMany({ include: { sourceBook: true }, orderBy: { name: "asc" } }),
    prisma.monster.findMany({ include: { sourceBook: true }, orderBy: { name: "asc" } }),
    prisma.classFeature.findMany({ include: { dndClass: true, dndSubclass: true, sourceBook: true }, orderBy: [{ level: "asc" }, { name: "asc" }] }),
    prisma.dndClass.findMany({ orderBy: { name: "asc" } }),
    prisma.dndSubclass.findMany({ orderBy: { name: "asc" } }),
    prisma.sourceBook.findMany({ orderBy: { code: "asc" } }),
    prisma.weaponMasteryProperty.findMany({ orderBy: { name: "asc" } }),
  ]);
  return { spells, items, feats, monsters, classFeatures, classes, subclasses, sourceBooks, masteries };
}

export async function deleteAdminCompendiumRecord(kind: "spell" | "item" | "feat" | "monster" | "classFeature", id: string) {
  await requireAdminAccess();
  if (kind === "spell") return prisma.spell.delete({ where: { id } });
  if (kind === "item") return prisma.equipmentItem.delete({ where: { id } });
  if (kind === "feat") return prisma.feat.delete({ where: { id } });
  if (kind === "monster") return prisma.monster.delete({ where: { id } });
  return prisma.classFeature.delete({ where: { id } });
}

export async function createAdminClassFeature(data: { sourceBookId: string; dndClassId: string; dndSubclassId?: string | null; level: number; name: string; description: string }) {
  await requireAdminAccess();
  return prisma.classFeature.create({ data: { ...data, dndSubclassId: data.dndSubclassId || null } });
}

export async function updateAdminClassFeature(id: string, data: { level: number; name: string; description: string; dndSubclassId?: string | null }) {
  await requireAdminAccess();
  return prisma.classFeature.update({ where: { id }, data: { ...data, dndSubclassId: data.dndSubclassId || null } });
}

export async function createAdminSpell(data: { sourceBookId: string; slug: string; name: string; level: number; school: string; castingTime: string; range: string; components: Prisma.InputJsonValue; duration: string; description: string; materials?: string | null; higherLevels?: string | null; concentration: boolean; ritual: boolean; classes: Prisma.InputJsonValue }) {
  await requireAdminAccess();
  return prisma.spell.create({ data });
}

export async function updateAdminSpell(id: string, data: { sourceBookId: string; name: string; level: number; school: string; castingTime: string; range: string; components: Prisma.InputJsonValue; duration: string; description: string; materials?: string | null; higherLevels?: string | null; concentration: boolean; ritual: boolean; classes: Prisma.InputJsonValue }) {
  await requireAdminAccess();
  return prisma.spell.update({ where: { id }, data });
}

export async function createAdminFeat(data: { sourceBookId: string; slug: string; name: string; category: string; prerequisite?: string | null; levelRequirement?: number | null; description: string }) {
  await requireAdminAccess();
  return prisma.feat.create({ data });
}

export async function updateAdminFeat(id: string, data: { sourceBookId: string; name: string; category: string; prerequisite?: string | null; levelRequirement?: number | null; description: string }) {
  await requireAdminAccess();
  return prisma.feat.update({ where: { id }, data });
}

export async function createAdminItem(data: { sourceBookId: string; slug: string; name: string; category: string; description: string; type?: ItemType | null; costGp?: number | null; weightLb?: number | null; damageFormula?: string | null; damageType?: string | null; properties: string[]; rangeNormal?: number | null; rangeLong?: number | null; armorCategory?: ArmorCategory | null; armorClass?: number | null; shieldBonus?: number | null; dexterityBonusMax?: number | null; strengthRequirement?: number | null; stealthDisadvantage: boolean; masteryPropertyId?: string | null }) {
  await requireAdminAccess();
  return prisma.equipmentItem.create({ data });
}

export async function updateAdminItem(id: string, data: { sourceBookId: string; name: string; category: string; description: string; type?: ItemType | null; costGp?: number | null; weightLb?: number | null; damageFormula?: string | null; damageType?: string | null; properties: string[]; rangeNormal?: number | null; rangeLong?: number | null; armorCategory?: ArmorCategory | null; armorClass?: number | null; shieldBonus?: number | null; dexterityBonusMax?: number | null; strengthRequirement?: number | null; stealthDisadvantage: boolean; masteryPropertyId?: string | null }) {
  await requireAdminAccess();
  return prisma.equipmentItem.update({ where: { id }, data });
}

export async function createAdminMonster(data: { sourceBookId?: string | null; slug: string; name: string; size: CreatureSize; creatureType: string; subtype?: string | null; alignment?: string | null; challengeRating: string; cr?: number | null; armorClass: number; hitPoints: number; hitDice?: string | null; strength: number; dexterity: number; constitution: number; intelligence: number; wisdom: number; charisma: number; passivePerception?: number | null; isLegendary: boolean }) {
  await requireAdminAccess();
  return prisma.monster.create({ data });
}

export async function updateAdminMonster(id: string, data: { sourceBookId?: string | null; name: string; size: CreatureSize; creatureType: string; subtype?: string | null; alignment?: string | null; challengeRating: string; cr?: number | null; armorClass: number; hitPoints: number; hitDice?: string | null; strength: number; dexterity: number; constitution: number; intelligence: number; wisdom: number; charisma: number; passivePerception?: number | null; isLegendary: boolean }) {
  await requireAdminAccess();
  return prisma.monster.update({ where: { id }, data });
}
