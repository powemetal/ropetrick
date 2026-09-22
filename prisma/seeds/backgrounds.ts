import { prisma, resolveDataFile, getOrCreateSourceBook, slugify } from "./helpers";
import * as fs from "fs";

export async function seedBackgrounds(featMap: Map<string, string>) {
  const filePath = resolveDataFile("backgrounds.json");
  if (!filePath) return;
  const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const backgrounds = raw.background || [];
  console.log(`⏳ Traitement de ${backgrounds.length} historiques...`);

  const backgroundsData: any[] = [];

  for (const bg of backgrounds) {
    if (!bg.name) continue;
    const source = bg.source || "XPHB";
    const baseSlug = slugify(`${bg.name}-${source}`);
    const book = await getOrCreateSourceBook(source);

    let originFeatId: string | null = null;
    if (Array.isArray(bg.feats)) {
      for (const featEntry of bg.feats) {
        const rawFeatKey = Object.keys(featEntry)[0] || "";
        const featNameOnly = rawFeatKey.split("|")[0].trim().toLowerCase();
        if (featMap.has(featNameOnly)) {
          originFeatId = featMap.get(featNameOnly)!;
          break;
        }
      }
    }

    backgroundsData.push({
      slug: baseSlug,
      name: bg.name,
      source,
      originFeatId,
      skillProficiencies: bg.skillProficiencies || [],
      toolProficiencies: bg.toolProficiencies || [],
      startingEquipment: bg.startingEquipment || [],
      description: bg.entries ? JSON.stringify(bg.entries) : null,
      sourceBookId: book.id,
    });
  }

  if (backgroundsData.length > 0) {
    await prisma.background.createMany({
      data: backgroundsData,
      skipDuplicates: true,
    });
  }

  console.log("✅ Backgrounds insérés instantanément !");
}