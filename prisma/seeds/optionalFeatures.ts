import { prisma, resolveDataFile, getOrCreateSourceBook, slugify } from "./helpers";
import * as fs from "fs";

export async function seedOptionalFeatures() {
  const filePath = resolveDataFile("optionalfeatures.json");
  if (!filePath) return;
  const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const features = raw.optionalfeature || [];
  console.log(`⏳ Traitement de ${features.length} options modulaires...`);

  const featuresData: any[] = [];

  for (const f of features) {
    if (!f.name) continue;
    const source = f.source || "XPHB";
    const baseSlug = slugify(`${f.name}-${source}`);
    const book = await getOrCreateSourceBook(source);

    featuresData.push({
      slug: baseSlug,
      name: f.name,
      featureType: f.featureType || [],
      prerequisite: f.prerequisite || null,
      description: f.entries ? JSON.stringify(f.entries) : "",
      sourceBookId: book.id,
    });
  }

  if (featuresData.length > 0) {
    await prisma.optionalFeature.createMany({
      data: featuresData,
      skipDuplicates: true,
    });
  }

  console.log("✅ Options modulaires insérées instantanément !");
}