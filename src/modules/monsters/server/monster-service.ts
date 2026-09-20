"use server";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { MonsterCreateSchema, MonsterScaleSchema } from "@/modules/monsters/schemas";
import { scaleMonsterStats } from "@/modules/monsters/engine/monster-cr-rules";

export async function getMonsters() {
  return prisma.monster.findMany({ orderBy: [{ challengeRating: "asc" }, { name: "asc" }] });
}

export async function getMonster(monsterId: string) {
  return prisma.monster.findUnique({ where: { id: monsterId } });
}

export async function createMonster(data: unknown) {
  const input = MonsterCreateSchema.parse(data);
  const slug = `${input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
  return prisma.monster.create({ data: { slug, ...input, hitDice: input.hitDice ?? null, traits: input.traits as Prisma.InputJsonValue, actions: input.actions as Prisma.InputJsonValue, legendaryActions: input.legendaryActions as Prisma.InputJsonValue, lairActions: input.lairActions as Prisma.InputJsonValue, speed: input.speed as Prisma.InputJsonValue } });
}

export async function cloneAndScaleMonster(monsterId: string, data: unknown) {
  const input = MonsterScaleSchema.parse(data);
  const monster = await prisma.monster.findUnique({ where: { id: monsterId } });
  if (!monster) throw new Error("Monster not found");
  const stats = scaleMonsterStats(monster, input.direction);
  return prisma.monster.create({ data: { name: `${monster.name} (${input.direction === "up" ? "supérieur" : "inférieur"})`, slug: `${monster.slug}-${input.direction}-${Date.now()}`, size: monster.size, creatureType: monster.creatureType, alignment: monster.alignment, challengeRating: monster.challengeRating, armorClass: stats.armorClass, hitPoints: stats.hitPoints, hitDice: monster.hitDice, speed: monster.speed as Prisma.InputJsonValue, strength: monster.strength, dexterity: monster.dexterity, constitution: monster.constitution, intelligence: monster.intelligence, wisdom: monster.wisdom, charisma: monster.charisma, savingThrows: monster.savingThrows as Prisma.InputJsonValue, skills: monster.skills as Prisma.InputJsonValue, damageVulnerabilities: monster.damageVulnerabilities as Prisma.InputJsonValue, damageResistances: monster.damageResistances as Prisma.InputJsonValue, damageImmunities: monster.damageImmunities as Prisma.InputJsonValue, conditionImmunities: monster.conditionImmunities as Prisma.InputJsonValue, senses: monster.senses as Prisma.InputJsonValue, languages: monster.languages as Prisma.InputJsonValue, traits: monster.traits as Prisma.InputJsonValue, actions: monster.actions as Prisma.InputJsonValue, bonusActions: monster.bonusActions as Prisma.InputJsonValue, reactions: monster.reactions as Prisma.InputJsonValue, legendaryResistances: monster.legendaryResistances, legendaryActions: monster.legendaryActions as Prisma.InputJsonValue, lairActions: monster.lairActions as Prisma.InputJsonValue, isLegendary: monster.isLegendary, sourceBookId: monster.sourceBookId } });
}
