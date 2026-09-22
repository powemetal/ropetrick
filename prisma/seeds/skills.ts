import { prisma, resolveDataFile, getOrCreateSourceBook } from "./helpers";
import * as fs from "fs";

export async function seedSkills() {
  const filePath = resolveDataFile("skills.json");
  if (!filePath) return;
  const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const skills = raw.skill || [];
  console.log(`⏳ Traitement de ${skills.length} compétences...`);

  const uniqueSkills = new Map<string, any>();
  for (const s of skills) {
    if (!uniqueSkills.has(s.name.toLowerCase()) || s.source === "XPHB") {
      uniqueSkills.set(s.name.toLowerCase(), s);
    }
  }

  const skillsData: any[] = [];

  for (const [_, s] of uniqueSkills) {
    const code = s.name.toUpperCase().replace(/[^A-Z]/g, "_");
    const book = await getOrCreateSourceBook(s.source || "XPHB");

    skillsData.push({
      code,
      name: s.name,
      ability: s.ability.toUpperCase(),
      description: s.entries ? JSON.stringify(s.entries) : "",
      examples: "",
      sourceBookId: book.id,
    });
  }

  if (skillsData.length > 0) {
    await prisma.skillDefinition.createMany({
      data: skillsData,
      skipDuplicates: true,
    });
  }

  console.log("✅ Compétences insérées instantanément !");
}