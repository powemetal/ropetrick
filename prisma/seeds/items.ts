import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// 1. Parsing de la rareté vers l'Enum Prisma
function parseRarity(rawRarity?: string): any {
  if (!rawRarity) return "MUNDANE";
  const clean = rawRarity.trim().toLowerCase();
  switch (clean) {
    case "common": return "COMMON";
    case "uncommon": return "UNCOMMON";
    case "rare": return "RARE";
    case "very rare": return "VERY_RARE";
    case "legendary": return "LEGENDARY";
    case "artifact": return "ARTIFACT";
    case "variable": return "VARIABLE";
    default: return "MUNDANE";
  }
}

// 2. Parsing de l'attunement ("Requires Attunement By...")
function parseAttunement(rawAttunement?: string) {
  if (!rawAttunement || rawAttunement.toLowerCase() === "none") {
    return { requiresAttunement: false };
  }
  return { requiresAttunement: true };
}

// 3. Parsing des dégâts (ex: "1d8 Slashing" -> formula: "1d8", type: "Slashing")
function parseDamage(rawDamage?: string) {
  if (!rawDamage) return { formula: null, type: null };
  // Exemple: "1d8 Slashing" ou "2d6 Piercing"
  const match = rawDamage.match(/^([\d\+\-d\s]+)\s+([a-zA-Z]+)$/);
  if (match) {
    return { formula: match[1].trim(), type: match[2].trim() };
  }
  return { formula: rawDamage, type: null };
}

// 4. Détection de la magie et du bonus magique (ex: "+1 Longsword" -> isMagic: true, magicBonus: 1)
function parseMagicFromName(name: string) {
  const match = name.match(/^\+(\d+)\s+/);
  if (match) {
    return { isMagic: true, magicBonus: parseInt(match[1], 10) };
  }
  // D'autres objets magiques sans +X explicite dans le nom peuvent l'être, mais c'est une bonne base
  return { isMagic: false, magicBonus: 0 };
}

// 5. Conversion des propriétés textuelles en tableau JSON
function parseProperties(rawProperties?: string): string[] {
  if (!rawProperties) return [];
  return rawProperties.split(",").map((p) => p.trim()).filter(Boolean);
}

export async function seedItems(prisma: PrismaClient) {
  const csvFilePath = path.join(__dirname, "../data/Items.csv");

  if (!fs.existsSync(csvFilePath)) {
    console.warn(`⚠️ Fichier Items.csv introuvable à : ${csvFilePath}. Étape ignorée.`);
    return;
  }

  console.log("📖 Lecture et parsing de Items.csv...");
  const rawContent = fs.readFileSync(csvFilePath, "utf-8");

  const records = parse(rawContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  console.log(`${records.length} objets trouvés dans le CSV.`);

  // Synchronisation des livres sources
  const uniqueSources = Array.from(new Set(records.map((r: any) => r["Source"]?.trim()).filter(Boolean))) as string[];
  
  console.log("📚 Vérification et création des livres sources pour les objets...");
  for (const rawSource of uniqueSources) {
    await prisma.sourceBook.upsert({
      where: { code: rawSource },
      update: {},
      create: {
        code: rawSource,
        title: rawSource,
        isOfficial: true,
        enabledByDefault: false,
      },
    });
  }

  const allBooks = await prisma.sourceBook.findMany();
  const sourceBookMap = new Map<string, string>();
  for (const book of allBooks) {
    sourceBookMap.set(book.code, book.id);
  }

  // Préparation des données avec le parsing intelligent
  const usedSlugs = new Set<string>();
  const itemsData = records.map((r: any) => {
    const rawName = r["Name"]?.trim() || "Objet sans nom";
    const rawSource = r["Source"]?.trim() || "PHB";
    const baseSlug = slugify(`${rawName} ${rawSource}`);
    let finalSlug = baseSlug;
    let counter = 1;

    while (usedSlugs.has(finalSlug)) {
      finalSlug = `${baseSlug}-${counter++}`;
    }
    usedSlugs.add(finalSlug);

    const weightNum = r["Weight"] ? parseFloat(r["Weight"]) : null;
    const valueNum = r["Value"] ? parseInt(r["Value"], 10) : null;

    const damageParsed = parseDamage(r["Damage"]);
    const attunementParsed = parseAttunement(r["Attunement"]);
    const magicParsed = parseMagicFromName(rawName);

    return {
      slug: finalSlug,
      name: rawName,
      sourceBookId: sourceBookMap.get(rawSource) ?? null,
      page: r["Page"] ? String(r["Page"]).trim() : null,
      category: r["Type"]?.trim() || null,
      type: r["Type"]?.trim() || null,
      rarity: parseRarity(r["Rarity"]),
      requiresAttunement: attunementParsed.requiresAttunement,
      isMagic: magicParsed.isMagic || parseRarity(r["Rarity"]) !== "MUNDANE",
      magicBonus: magicParsed.magicBonus,
      damageFormula: damageParsed.formula,
      damageType: damageParsed.type,
      properties: parseProperties(r["Properties"]), // Stocké direct en JSON array
      weaponMastery: r["Mastery"] ? r["Mastery"].replace(/^Mastery:\s*/i, "").trim() : null,
      weightLb: isNaN(weightNum as number) ? null : weightNum,
      costGp: isNaN(valueNum as number) ? null : valueNum,
      description: r["Text"]?.trim() || "",
    };
  });

  // Purge et insertion en masse
  console.log("🧹 Purge de la table des équipements...");
  // await prisma.characterInventoryItem.deleteMany();
  // await prisma.equipmentItem.deleteMany();

  console.log(`⚡ Insertion en masse de ${itemsData.length} objets avec parsing avancé...`);
  const chunkSize = 100;
  let count = 0;

  for (let i = 0; i < itemsData.length; i += chunkSize) {
    const chunk = itemsData.slice(i, i + chunkSize);
    await prisma.equipmentItem.createMany({
      data: chunk as any,
      skipDuplicates: true,
    });
    count += chunk.length;
    console.log(`-> ${count} / ${itemsData.length} objets insérés...`);
  }

  console.log("✅ Table des équipements importée et structurée avec succès !");
}