import { z } from "zod";

export const MonsterCreateSchema = z.object({
  name: z.string().min(1),
  creatureType: z.string().min(1),
  challengeRating: z.string().min(1),
  armorClass: z.number().int().min(1),
  hitPoints: z.number().int().min(1),
  hitDice: z.string().nullable().optional(),
  isLegendary: z.boolean().default(false),
  legendaryResistances: z.number().int().min(0).max(3).default(0),
  traits: z.array(z.object({ name: z.string(), description: z.string() })).default([]),
  actions: z.array(z.object({ name: z.string(), description: z.string() })).default([]),
  legendaryActions: z.array(z.object({ name: z.string(), description: z.string() })).default([]),
  lairActions: z.array(z.object({ name: z.string(), description: z.string() })).default([]),
  speed: z.record(z.string(), z.number()).default({ walk: 30 }),
});

export const MonsterScaleSchema = z.object({ direction: z.enum(["up", "down"]) });
