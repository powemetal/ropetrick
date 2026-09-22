import { prisma, resolveDataFile, getOrCreateSourceBook, slugify } from "./helpers";
import * as fs from "fs";

export async function seedDeities() {
  const filePath = resolveDataFile("deities.json");
  if (!filePath) return;
  const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const deities = raw.deity || [];
  console.log(`⏳ Traitement de ${deities.length} divinités...`);

  const deitiesData: any[] = [];

  for (const d of deities) {
    if (!d.name || !d.pantheon) continue;
    const source = d.source || "XPHB";
    const baseSlug = slugify(`${d.pantheon}-${d.name}-${source}`);
    const book = await getOrCreateSourceBook(source);
    const descriptionText = Array.isArray(d.entries) ? JSON.stringify(d.entries) : (d.entries || null);

    deitiesData.push({
      slug: baseSlug,
      name: d.name,
      pantheon: d.pantheon,
      alignment: d.alignment || [],
      title: d.title || null,
      domains: d.domains || [],
      province: d.province || null,
      symbol: typeof d.symbol === "string" ? d.symbol : null,
      description: descriptionText,
      sourceBookId: book.id,
    });
  }

  if (deitiesData.length > 0) {
    await prisma.deity.createMany({
      data: deitiesData,
      skipDuplicates: true,
    });
  }

  console.log("✅ Divinités insérées instantanément !");
}