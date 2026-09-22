import { prisma, resolveDataFile, getOrCreateSourceBook, slugify } from "./helpers";
import { CreatureSize } from "@prisma/client";
import * as fs from "fs";

export async function seedSpecies() {
  const filePath = resolveDataFile("races.json");
  if (!filePath) return;
  const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const races = raw.race || [];
  console.log(`⏳ Traitement de ${races.length} races/espèces...`);

  const speciesData: any[] = [];

  for (const r of races) {
    if (!r.name) continue;
    const source = r.source || "XPHB";
    const baseSlug = slugify(`${r.name}-${source}`);
    const book = await getOrCreateSourceBook(source);

    let speed = 30;
    if (typeof r.speed === "number") speed = r.speed;
    else if (r.speed?.walk && typeof r.speed.walk === "number") speed = r.speed.walk;

    let size: CreatureSize = CreatureSize.MEDIUM;
    if (Array.isArray(r.size)) {
      if (r.size.includes("S") && !r.size.includes("M")) size = CreatureSize.SMALL;
      else if (r.size.includes("L")) size = CreatureSize.LARGE;
      else if (r.size.includes("T")) size = CreatureSize.TINY;
    }

    speciesData.push({
      slug: baseSlug,
      name: r.name,
      speed,
      size,
      darkvision: typeof r.darkvision === "number" ? r.darkvision : null,
      traits: r.entries || [],
      sourceBookId: book.id,
    });
  }

  if (speciesData.length > 0) {
    await prisma.species.createMany({
      data: speciesData,
      skipDuplicates: true,
    });
  }

  console.log("✅ Races/Espèces insérées instantanément !");
}