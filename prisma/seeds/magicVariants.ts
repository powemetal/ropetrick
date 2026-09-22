import { prisma, resolveDataFile, getOrCreateSourceBook, slugify } from "./helpers";
import * as fs from "fs";

export async function seedMagicVariants() {
  const filePath = resolveDataFile("magicvariants.json");
  if (!filePath) return;
  const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const variants = raw.magicvariant || [];
  console.log(`⏳ Traitement de ${variants.length} variantes magiques...`);

  const variantsData: any[] = [];

  for (const v of variants) {
    if (!v.name) continue;
    const source = v.inherits?.source || "XDMG";
    const baseSlug = slugify(`${v.name}-${source}-${Math.random().toString(36).substring(2, 7)}`);
    const book = await getOrCreateSourceBook(source);

    variantsData.push({
      slug: baseSlug,
      name: v.name,
      type: v.type || null,
      rarity: v.inherits?.rarity || null,
      requires: v.requires || null,
      entries: v.entries || v.inherits?.entries || [],
      sourceBookId: book.id,
    });
  }

  if (variantsData.length > 0) {
    await prisma.magicVariant.createMany({
      data: variantsData,
      skipDuplicates: true,
    });
  }

  console.log("✅ Variantes magiques insérées instantanément !");
}