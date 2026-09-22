import { prisma, resolveDataFile } from "./helpers";
import * as fs from "fs";

export async function seedLanguages() {
  const filePath = resolveDataFile("languages.json");
  if (!filePath) return;
  const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const languages = raw.language || [];
  console.log(`⏳ Traitement de ${languages.length} langues...`);

  const languagesData: any[] = [];

  for (const lang of languages) {
    if (!lang.name) continue;
    const isExotic = ["exotic", "rare", "secret"].includes(lang.type);

    languagesData.push({
      name: lang.name,
      script: typeof lang.script === "string" ? lang.script : "Common",
      isExotic,
    });
  }

  if (languagesData.length > 0) {
    await prisma.language.createMany({
      data: languagesData,
      skipDuplicates: true,
    });
  }

  console.log("✅ Langues insérées instantanément !");
}