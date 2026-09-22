import { prisma, resolveDataFile, getOrCreateSourceBook, slugify } from "./helpers";
import * as fs from "fs";

export async function seedFeats() {
  const featMap = new Map<string, string>();
  const filePath = resolveDataFile("feats.json");
  if (!filePath) return featMap;
  const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const feats = raw.feat || [];
  console.log(`⏳ Traitement de ${feats.length} dons...`);

  const featsData: any[] = [];

  for (const f of feats) {
    if (!f.name) continue;
    const source = f.source || "XPHB";
    const baseSlug = slugify(`${f.name}-${source}`);
    const book = await getOrCreateSourceBook(source);

    let levelRequirement = 0;
    let prerequisiteText: string | null = null;
    if (Array.isArray(f.prerequisite)) {
      prerequisiteText = JSON.stringify(f.prerequisite);
      for (const prereq of f.prerequisite) {
        if (typeof prereq.level === "number") {
          levelRequirement = prereq.level;
          break;
        }
      }
    }

    featsData.push({
      slug: baseSlug,
      name: f.name,
      source,
      category: f.category || null,
      levelRequirement,
      prerequisite: prerequisiteText,
      description: f.entries ? JSON.stringify(f.entries) : "",
      repeatable: Boolean(f.repeatable),
      sourceBookId: book.id,
    });
  }

  if (featsData.length > 0) {
    await prisma.feat.createMany({
      data: featsData,
      skipDuplicates: true,
    });
  }

  // Récupération globale des IDs pour alimenter le dictionnaire en mémoire
  const insertedFeats = await prisma.feat.findMany({
    select: { id: true, name: true, slug: true },
  });

  for (const feat of insertedFeats) {
    featMap.set(feat.name.toLowerCase(), feat.id);
    featMap.set(slugify(feat.name), feat.id);
    featMap.set(feat.slug, feat.id);
  }

  console.log("✅ Dons insérés instantanément !");
  return featMap;
}