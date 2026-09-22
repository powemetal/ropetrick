import { prisma, resolveDataFile, getOrCreateSourceBook, slugify } from "./helpers";
import { ItemType, ArmorCategory } from "@prisma/client";
import * as fs from "fs";

export async function seedEquipment(masteryMap: Map<string, string>) {
  const filePath = resolveDataFile("items-base.json");
  if (!filePath) return;
  const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const items = raw.baseitem || [];
  console.log(`⏳ Traitement de ${items.length} items de base...`);

  const equipmentData: any[] = [];

  for (const it of items) {
    if (!it.name) continue;
    const source = it.source || "XPHB";
    const baseSlug = slugify(`${it.name}-${source}`);
    const book = await getOrCreateSourceBook(source);
    const rawCode = (it.type || "").split("|")[0].trim().toUpperCase();

    let type: ItemType = ItemType.GEAR;
    let armorCategory: ArmorCategory = ArmorCategory.NONE;

    if (rawCode === "LA") { type = ItemType.ARMOR; armorCategory = ArmorCategory.LIGHT; }
    else if (rawCode === "MA") { type = ItemType.ARMOR; armorCategory = ArmorCategory.MEDIUM; }
    else if (rawCode === "HA") { type = ItemType.ARMOR; armorCategory = ArmorCategory.HEAVY; }
    else if (rawCode === "S" || it.name.toLowerCase().includes("shield")) { type = ItemType.SHIELD; armorCategory = ArmorCategory.SHIELD; }
    else if (rawCode === "M" || rawCode === "R" || it.weapon) { type = ItemType.WEAPON; }
    else if (["AT", "INS", "T", "GS"].includes(rawCode)) { type = ItemType.TOOL; }
    else if (["A", "AF"].includes(rawCode)) { type = ItemType.AMMUNITION; }
    else if (["P", "SC", "EXP"].includes(rawCode) || it.poison) { type = ItemType.CONSUMABLE; }

    let masteryPropertyId: string | null = null;
    if (Array.isArray(it.mastery) && it.mastery.length > 0) {
      const rawMastery = it.mastery[0].split("|")[0].trim().toLowerCase();
      if (masteryMap.has(rawMastery)) masteryPropertyId = masteryMap.get(rawMastery)!;
    }

    let damageType: string | null = null;
    if (it.dmgType === "S") damageType = "slashing";
    else if (it.dmgType === "P") damageType = "piercing";
    else if (it.dmgType === "B") damageType = "bludgeoning";

    equipmentData.push({
      slug: baseSlug,
      name: it.name,
      category: it.weaponCategory || it.type || "gear",
      description: JSON.stringify(it.entries || []),
      type,
      armorCategory,
      armorClass: typeof it.ac === "number" ? it.ac : null,
      damageFormula: it.dmg1 || null,
      damageType,
      properties: Array.isArray(it.property) ? it.property : [],
      weightLb: typeof it.weight === "number" ? it.weight : null,
      costCp: typeof it.value === "number" ? Math.round(it.value) : null,
      masteryPropertyId,
      sourceBookId: book.id,
    });
  }

  if (equipmentData.length > 0) {
    await prisma.equipmentItem.createMany({
      data: equipmentData,
      skipDuplicates: true,
    });
  }

  console.log("✅ Items de base insérés instantanément !");
}