import { prisma, resolveDataFile } from "./helpers";
import * as fs from "fs";

export async function seedSourceBooks() {
  const filePath = resolveDataFile("books.json");
  if (!filePath) return;
  const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const books = raw.book || [];
  console.log(`⏳ Traitement de ${books.length} livres source...`);

  const booksData: any[] = [];

  for (const b of books) {
    if (!b.id) continue;
    const cleanCode = b.id.toUpperCase();
    booksData.push({
      code: cleanCode,
      title: b.name || `${cleanCode} Sourcebook`,
      isOfficial: true,
      enabledByDefault: cleanCode === "XPHB" || cleanCode === "PHB",
    });
  }

  if (booksData.length > 0) {
    await prisma.sourceBook.createMany({
      data: booksData,
      skipDuplicates: true,
    });
  }

  console.log("✅ Livres sources insérés instantanément !");
}