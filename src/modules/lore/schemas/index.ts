import { z } from "zod";

export const LocationSchema = z.object({
  campaignId: z.string().min(1),
  parentId: z.string().nullable().optional(),
  name: z.string().min(1),
  description: z.string(),
  isSecretDm: z.boolean().default(false),
});

export const NPCSchema = z.object({
  campaignId: z.string().min(1),
  name: z.string().min(1),
  race: z.string().nullable().optional(),
  occupation: z.string().nullable().optional(),
  appearance: z.string(),
  secretsDm: z.string().nullable().optional(),
  isSecretDm: z.boolean().default(false),
});

export const ShopSchema = z.object({
  campaignId: z.string().min(1),
  locationId: z.string().nullable().optional(),
  keeperNpcId: z.string().nullable().optional(),
  name: z.string().min(1),
  shopType: z.string().min(1),
});

export const ShopItemSchema = z.object({
  shopId: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  rarity: z.enum(["MUNDANE", "COMMON", "UNCOMMON", "RARE", "VERY_RARE", "LEGENDARY", "ARTIFACT"]),
  isMagic: z.boolean().default(false),
  priceCp: z.number().int().nonnegative(),
  stockQuantity: z.number().int().min(-1).default(-1),
});
