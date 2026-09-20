"use server";

import { prisma } from "@/lib/prisma";
import { LocationSchema, NPCSchema, ShopItemSchema, ShopSchema } from "@/modules/lore/schemas";
import { requireCampaignManagerAccess, getCampaignMemberRole } from "@/modules/campaigns/server/campaign-service";

const canSeeSecrets = async (campaignId: string, userId: string) => {
  const role = await getCampaignMemberRole(campaignId, userId);
  if (!role) throw new Error("Campaign access denied");
  return role === "DM" || role === "CO_DM";
};

export async function createLocation(userId: string, data: unknown) {
  const input = LocationSchema.parse(data);
  await requireCampaignManagerAccess(input.campaignId, userId);
  return prisma.location.create({ data: input });
}

export async function updateLocation(userId: string, locationId: string, data: unknown) {
  const location = await prisma.location.findUnique({ where: { id: locationId }, select: { campaignId: true } });
  if (!location) throw new Error("Location not found");
  await requireCampaignManagerAccess(location.campaignId, userId);
  return prisma.location.update({ where: { id: locationId }, data: LocationSchema.omit({ campaignId: true }).partial().parse(data) });
}

export async function deleteLocation(userId: string, locationId: string) {
  const location = await prisma.location.findUnique({ where: { id: locationId }, select: { campaignId: true } });
  if (!location) throw new Error("Location not found");
  await requireCampaignManagerAccess(location.campaignId, userId);
  return prisma.location.delete({ where: { id: locationId } });
}

export async function getLocations(campaignId: string, userId: string) {
  const showSecrets = await canSeeSecrets(campaignId, userId);
  return prisma.location.findMany({ where: { campaignId, ...(showSecrets ? {} : { isSecretDm: false }) }, orderBy: { name: "asc" } });
}

export async function createNPC(userId: string, data: unknown) {
  const input = NPCSchema.parse(data);
  await requireCampaignManagerAccess(input.campaignId, userId);
  return prisma.nPC.create({ data: input });
}

export async function updateNPC(userId: string, npcId: string, data: unknown) {
  const npc = await prisma.nPC.findUnique({ where: { id: npcId }, select: { campaignId: true } });
  if (!npc) throw new Error("NPC not found");
  await requireCampaignManagerAccess(npc.campaignId, userId);
  return prisma.nPC.update({ where: { id: npcId }, data: NPCSchema.omit({ campaignId: true }).partial().parse(data) });
}

export async function deleteNPC(userId: string, npcId: string) {
  const npc = await prisma.nPC.findUnique({ where: { id: npcId }, select: { campaignId: true } });
  if (!npc) throw new Error("NPC not found");
  await requireCampaignManagerAccess(npc.campaignId, userId);
  return prisma.nPC.delete({ where: { id: npcId } });
}

export async function getNPCs(campaignId: string, userId: string) {
  const showSecrets = await canSeeSecrets(campaignId, userId);
  return prisma.nPC.findMany({
    where: { campaignId, ...(showSecrets ? {} : { isSecretDm: false }) },
    select: { id: true, campaignId: true, name: true, race: true, occupation: true, appearance: true, isSecretDm: true, ...(showSecrets ? { secretsDm: true } : {}) },
    orderBy: { name: "asc" },
  });
}

export async function createShop(userId: string, data: unknown) {
  const input = ShopSchema.parse(data);
  await requireCampaignManagerAccess(input.campaignId, userId);
  return prisma.shop.create({ data: input });
}

export async function updateShop(userId: string, shopId: string, data: unknown) {
  const shop = await prisma.shop.findUnique({ where: { id: shopId }, select: { campaignId: true } });
  if (!shop) throw new Error("Shop not found");
  await requireCampaignManagerAccess(shop.campaignId, userId);
  return prisma.shop.update({ where: { id: shopId }, data: ShopSchema.omit({ campaignId: true }).partial().parse(data) });
}

export async function deleteShop(userId: string, shopId: string) {
  const shop = await prisma.shop.findUnique({ where: { id: shopId }, select: { campaignId: true } });
  if (!shop) throw new Error("Shop not found");
  await requireCampaignManagerAccess(shop.campaignId, userId);
  return prisma.shop.delete({ where: { id: shopId } });
}

export async function createShopItem(userId: string, data: unknown) {
  const input = ShopItemSchema.parse(data);
  const shop = await prisma.shop.findUnique({ where: { id: input.shopId }, select: { campaignId: true } });
  if (!shop) throw new Error("Shop not found");
  await requireCampaignManagerAccess(shop.campaignId, userId);
  return prisma.shopItem.create({ data: input });
}

export async function updateShopItem(userId: string, itemId: string, data: unknown) {
  const item = await prisma.shopItem.findUnique({ where: { id: itemId }, include: { shop: { select: { campaignId: true } } } });
  if (!item) throw new Error("Shop item not found");
  await requireCampaignManagerAccess(item.shop.campaignId, userId);
  return prisma.shopItem.update({ where: { id: itemId }, data: ShopItemSchema.omit({ shopId: true }).partial().parse(data) });
}

export async function deleteShopItem(userId: string, itemId: string) {
  const item = await prisma.shopItem.findUnique({ where: { id: itemId }, include: { shop: { select: { campaignId: true } } } });
  if (!item) throw new Error("Shop item not found");
  await requireCampaignManagerAccess(item.shop.campaignId, userId);
  return prisma.shopItem.delete({ where: { id: itemId } });
}

export async function getShops(campaignId: string, userId: string) {
  const showSecrets = await canSeeSecrets(campaignId, userId);
  const shops = await prisma.shop.findMany({
    where: { campaignId },
    include: {
      location: { select: { name: true, isSecretDm: true } },
      keeperNpc: { select: { id: true, name: true, isSecretDm: true } },
      items: true,
    },
    orderBy: { name: "asc" },
  });

  return shops.map((shop) => ({
    ...shop,
    location: showSecrets || !shop.location?.isSecretDm ? shop.location : null,
    keeperNpc: showSecrets || !shop.keeperNpc?.isSecretDm ? shop.keeperNpc : null,
  }));
}

export async function getLoreDirectory(campaignId: string, userId: string) {
  const [locations, npcs, shops] = await Promise.all([getLocations(campaignId, userId), getNPCs(campaignId, userId), getShops(campaignId, userId)]);
  return { locations, npcs, shops };
}
