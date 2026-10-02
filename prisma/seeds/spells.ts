import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

const CSV_SOURCE_MAP: Record<string, string> = {
  "PHB'14": "PHB_2014",
  "PHB'24": "PHB_2024",
  "AU": "AU_2026",
  "FTD": "FToD",
  "BMT": "BoMT",
};

const NEW_SOURCE_TITLES: Record<string, string> = {
  HGtMH: "Heliana's Guide to Monster Hunting",
  FRHoF: "Heroes of Faerûn",
  EGW: "Explorer's Guide to Wildemount",
  HWCS: "Humblewood Campaign Setting",
  AI: "Acquisitions Incorporated",
  AAG: "Astral Adventurer's Guide",
  IDRotF: "Icewind Dale: Rime of the Frostmaiden",
  SatO: "Sigil and the Outlands",
  GGR: "Guildmasters' Guide to Ravnica",
  EFA: "Elminster's Forgotten Arcana",
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseSpellLevel(levelStr: string): number {
  if (!levelStr) return 0;
  const clean = levelStr.trim().toLowerCase();
  if (clean === "cantrip") return 0;
  const match = clean.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

function parseComponents(raw: string): { components: string[]; materials: string | null } {
  if (!raw) return { components: [], materials: null };

  const components: string[] = [];
  if (/\bV\b/.test(raw)) components.push("V");
  if (/\bS\b/.test(raw)) components.push("S");
  if (/\bM\b/.test(raw)) components.push("M");

  const matMatch = raw.match(/\((.*?)\)/);
  const materials = matMatch ? matMatch[1].trim() : null;

  return { components, materials };
}

function parseStringList(raw?: string | null): string[] {
  if (!raw || !raw.trim()) return [];

  const resultSet = new Set<string>();
  const items = raw.split(",");

  for (const item of items) {
    const cleaned = item.replace(/\(.*?\)/g, "").replace(/\s+/g, " ").trim();
    if (cleaned) {
      resultSet.add(cleaned);
    }
  }

  return Array.from(resultSet).sort();
}

function cleanHtmlDescription(html: string | null): string {
  if (!html) return "";

  return html
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<br\s*[\/]?>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/@(?:Item|JournalEntry|Actor|RollTable|Compendium|UUID|config|embed|variantrule|spell|creature|action|feat)\[([^\vert{}\]]+)(?:\|[^\]]+)*\]/g, "$1")
    .replace(/\[\[\/damage\s+([0-9d+\s-]+)(?:\s+type=([a-z]+))?\]\]/gi, "$1 $2")
    .replace(/\[\[\/[a-z]+\s+([^\]]+)\]\]/gi, "$1")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter((line) => line.length > 0)
    .join("\n");
}

export async function seedSpells(prisma: PrismaClient) {
  const csvFilePath = path.join(__dirname, "../data_personnal/Spells.csv");

  if (!fs.existsSync(csvFilePath)) {
    throw new Error(`Le fichier Spells.csv est introuvable à : ${csvFilePath}`);
  }

  console.log("📖 Lecture et parsing de Spells.csv...");
  const rawContent = fs.readFileSync(csvFilePath, "utf-8");

  const records = parse(rawContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  console.log(`${records.length} entrées trouvées dans le CSV.`);

  // 1. Synchronisation des livres sources
  const uniqueCsvSources = Array.from(new Set(records.map((r: any) => r["Source"].trim()))) as string[];
  const sourceBookMap = new Map<string, string>();

  console.log("📚 Vérification et création des livres sources nécessaires...");
  for (const rawSource of uniqueCsvSources) {
    const targetCode = CSV_SOURCE_MAP[rawSource] ?? rawSource;

    const book = await prisma.sourceBook.upsert({
      where: { code: targetCode },
      update: {},
      create: {
        code: targetCode,
        title: NEW_SOURCE_TITLES[targetCode] ?? targetCode,
        isOfficial: !["HGtMH", "HWCS", "AU_2026", "EFA"].includes(targetCode),
        enabledByDefault: false,
      },
    });

    sourceBookMap.set(rawSource, book.id);
  }

  // 2. Préparation des données avec application du nettoyage
  const usedSlugs = new Set<string>();

  const spellsData = records.map((r: any) => {
    const rawSource = r["Source"].trim();
    const baseSlug = slugify(`${r["Name"]} ${rawSource}`);
    let finalSlug = baseSlug;
    let counter = 1;

    while (usedSlugs.has(finalSlug)) {
      finalSlug = `${baseSlug}-${counter++}`;
    }
    usedSlugs.add(finalSlug);

    const rawSchool = r["School"] || "Universal";
    const isRitual = rawSchool.toLowerCase().includes("ritual");
    const cleanSchool = rawSchool.replace(/\s*\(ritual\)/i, "").trim();

    const { components, materials } = parseComponents(r["Components"] || "");
    const isConcentration = (r["Duration"] || "").toLowerCase().includes("concentration");

    return {
      slug: finalSlug,
      name: r["Name"].trim(),
      source: rawSource,
      sourceBookId: sourceBookMap.get(rawSource) ?? null,
      page: r["Page"] ? String(r["Page"]).trim() : null,
      level: parseSpellLevel(r["Level"]),
      school: cleanSchool,
      castingTime: r["Casting Time"]?.trim() || "1 action",
      range: r["Range"]?.trim() || "Touch",
      components,
      materials,
      duration: r["Duration"]?.trim() || "Instantaneous",
      concentration: isConcentration,
      ritual: isRitual,
      description: cleanHtmlDescription(r["Text"]),
      higherLevels: cleanHtmlDescription(r["At Higher Levels"]) || null,
      classes: parseStringList(r["Classes"]),
      optionalClasses: parseStringList(r["Optional/Variant Classes"]),
      subclasses: parseStringList(r["Subclasses"]),
    };
  });

  // 3. Purge complète des sorts et de leurs liaisons
  console.log("🧹 Purge de la table des sorts (et des liaisons de personnages)...");
  await prisma.characterSpell.deleteMany();
  await prisma.spell.deleteMany();

  // 4. Réinsertion complète par paquets de 100
  console.log(`⚡ Remplacement et insertion des ${spellsData.length} sorts nettoyés...`);
  const chunkSize = 100;
  let count = 0;

  for (let i = 0; i < spellsData.length; i += chunkSize) {
    const chunk = spellsData.slice(i, i + chunkSize);
    await prisma.spell.createMany({
      data: chunk,
    });
    count += chunk.length;
    console.log(`-> ${count} / ${spellsData.length} sorts insérés...`);
  }

  console.log("✅ Table des sorts réimportée et nettoyée avec succès !");
}