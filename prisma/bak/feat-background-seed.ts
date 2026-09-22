import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

// Mapping des codes de sources
const SOURCE_CODE_MAP: Record<string, string> = {
  PHB: "PHB_2014",
  XPHB: "PHB_2024",
  AU: "AU_2026",
  BMT: "BoMT",
  FTD: "FToD",
  PSK: "PS_K",
  PSX: "PS_A",
  ToA: "ToA",
};

const SOURCE_TITLES: Record<string, string> = {
  ABH: "Astarion's Book of Haunts",
  AU: "Arcana Unleashed",
  BGG: "Bigby Presents: Glory of the Giants",
  BMT: "The Book of Many Things",
  DSotDQ: "Dragonlance: Shadow of the Dragon Queen",
  EFA: "Elminster's Forgotten Arcana",
  ERLW: "Eberron: Rising from the Last War",
  FRHoF: "Heroes of Faerûn",
  FTD: "Fizban's Treasury of Dragons",
  LFL: "Lorwyn: First Light",
  MTF: "Mordenkainen's Tome of Foes",
  PHB: "Player's Handbook 2014",
  PSK: "Plane Shift: Kaladesh",
  PSX: "Plane Shift: Ixalan",
  RHW: "Ravenloft: Heroes & Wickedness",
  SCC: "Strixhaven: A Curriculum of Chaos",
  SatO: "Sigil and the Outlands",
  TCE: "Tasha's Cauldron of Everything",
  ToA: "Tomb of Annihilation",
  XGE: "Xanathar's Guide to Everything",
  XPHB: "Player's Handbook 2024",
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function cleanFormatting(str: string): string {
  return str
    .replace(/\{@dc\s+([^|}]+)[^}]*\}/gi, "DC $1")
    .replace(/\{@dice\s+([^|}]+)[^}]*\}/gi, "$1")
    .replace(/\{@damage\s+([^|}]+)[^}]*\}/gi, "$1")
    .replace(/\{@b\s+([^|}]+)[^}]*\}/gi, "**$1**")
    .replace(/\{@i\s+([^|}]+)[^}]*\}/gi, "*$1*")
    .replace(/\{@\w+\s+([^|}]+)[^}]*\}/gi, "$1");
}

function parseEntries(entries: any[]): string {
  if (!Array.isArray(entries)) return "";
  const lines: string[] = [];

  for (const node of entries) {
    if (typeof node === "string") {
      lines.push(cleanFormatting(node));
    } else if (typeof node === "object" && node !== null) {
      const title = node.name ? `**${cleanFormatting(node.name)}**\n` : "";

      if (node.type === "entries" || node.entries) {
        lines.push(`${title}${parseEntries(node.entries)}`.trim());
      } else if (node.type === "list" && Array.isArray(node.items)) {
        const items = node.items.map((it: any) => {
          if (typeof it === "object" && it.type === "item") {
            const entryText = it.entry ? cleanFormatting(it.entry) : parseEntries(it.entries || []);
            return `* **${cleanFormatting(it.name)}**: ${entryText}`;
          }
          return `* ${typeof it === "string" ? cleanFormatting(it) : parseEntries([it])}`;
        });
        lines.push(items.join("\n"));
      } else if (node.type === "table") {
        const tableLines: string[] = [];
        if (node.caption) tableLines.push(`*${node.caption}*`);
        if (node.colLabels) {
          tableLines.push("| " + node.colLabels.map(cleanFormatting).join(" | ") + " |");
          tableLines.push("| " + node.colLabels.map(() => "---").join(" | ") + " |");
        }
        if (Array.isArray(node.rows)) {
          for (const row of node.rows) {
            tableLines.push("| " + row.map((c: any) => cleanFormatting(String(c))).join(" | ") + " |");
          }
        }
        lines.push(tableLines.join("\n"));
      }
    }
  }

  return lines.filter(Boolean).join("\n\n");
}

function mapCategory(cat?: string, level = 1): string {
  if (!cat) return level >= 19 ? "EPIC_BOON" : level === 1 ? "ORIGIN" : "GENERAL";
  switch (cat.toUpperCase()) {
    case "O":
      return "ORIGIN";
    case "EB":
      return "EPIC_BOON";
    case "FS":
    case "FS:P":
    case "FS:R":
      return "FIGHTING_STYLE";
    case "D":
      return "DRAGONMARK";
    case "DG":
      return "DARK_GIFT";
    default:
      return "GENERAL";
  }
}

function formatPrerequisites(prereqs?: any[]): { level: number; text: string | null } {
  if (!prereqs || !Array.isArray(prereqs) || prereqs.length === 0) {
    return { level: 1, text: null };
  }

  let minLevel = 1;
  const parts: string[] = [];

  for (const p of prereqs) {
    if (typeof p !== "object" || p === null) continue;

    if (p.level) {
      const lvl = typeof p.level === "number" ? p.level : p.level.level;
      if (lvl && lvl > minLevel) minLevel = lvl;
      parts.push(`Niveau ${lvl}+`);
    }
    if (p.ability && Array.isArray(p.ability)) {
      for (const ab of p.ability) {
        for (const [k, v] of Object.entries(ab)) {
          parts.push(`${k.toUpperCase()} ${v}+`);
        }
      }
    }
    if (p.spellcasting || p.spellcasting2020 || p.spellcastingFeature) {
      parts.push("Aptitude à lancer des sorts");
    }
    if (p.race && Array.isArray(p.race)) {
      parts.push(`Espèce : ${p.race.map((r: any) => r.name || r.subrace).join(", ")}`);
    }
    if (p.proficiency && Array.isArray(p.proficiency)) {
      for (const prof of p.proficiency) {
        for (const [k, v] of Object.entries(prof)) {
          parts.push(`Maîtrise : ${v} ${k}`);
        }
      }
    }
    if (p.feature && Array.isArray(p.feature)) {
      parts.push(`Aptitude : ${p.feature.join(", ")}`);
    }
    if (p.campaign && Array.isArray(p.campaign)) {
      parts.push(`Campagne : ${p.campaign.join(", ")}`);
    }
    if (p.other) {
      parts.push(String(p.other));
    }
  }

  return {
    level: minLevel,
    text: parts.length > 0 ? parts.join(" ; ") : null,
  };
}

// Extraction du slug de don d'origine depuis la référence d'un background
function extractFeatSlugFromBackground(bgFeats: any[]): string | null {
  if (!Array.isArray(bgFeats) || bgFeats.length === 0) return null;
  const firstFeatObj = bgFeats[0];
  if (typeof firstFeatObj !== "object" || firstFeatObj === null) return null;

  const rawKey = Object.keys(firstFeatObj)[0];
  if (!rawKey) return null;

  // Format type: "magic initiate; cleric|xphb" ou "arcane infiltrator|au"
  const featName = rawKey.split("|")[0].split(";")[0].trim();
  return slugify(featName);
}

// Extraction des caractéristiques AbilityScores
function extractAbilityChoices(abilityObjList?: any[]): string[] {
  if (!Array.isArray(abilityObjList)) return [];
  const abilities = new Set<string>();

  for (const item of abilityObjList) {
    const fromList = item?.choose?.weighted?.from || item?.choose?.from || [];
    for (const ab of fromList) {
      if (typeof ab === "string") abilities.add(ab.toLowerCase());
    }
  }
  return Array.from(abilities);
}

async function main() {
  const featsPath = path.join(__dirname, "data/feats.json");
  const bgsPath = path.join(__dirname, "data/backgrounds.json");

  if (!fs.existsSync(featsPath)) {
    throw new Error(`Fichier introuvable : ${featsPath}`);
  }
  if (!fs.existsSync(bgsPath)) {
    throw new Error(`Fichier introuvable : ${bgsPath}`);
  }

  const rawFeats = JSON.parse(fs.readFileSync(featsPath, "utf-8")).feat ?? [];
  const rawBackgrounds = JSON.parse(fs.readFileSync(bgsPath, "utf-8")).background ?? [];

  console.log(`Données chargées : ${rawFeats.length} dons, ${rawBackgrounds.length} historiques.`);

  // 1. Détecter et créer toutes les sources nécessaires
  const allSources = Array.from(
    new Set([...rawFeats.map((f: any) => f.source), ...rawBackgrounds.map((b: any) => b.source)].filter(Boolean))
  ) as string[];

  const sourceBookMap = new Map<string, string>();
  console.log("📚 Synchronisation des livres sources...");
  for (const src of allSources) {
    const code = SOURCE_CODE_MAP[src] ?? src;
    const title = SOURCE_TITLES[src] ?? code;

    const book = await prisma.sourceBook.upsert({
      where: { code },
      update: {},
      create: {
        code,
        title,
        isOfficial: !["ABH", "AU", "LFL", "RHW"].includes(src),
        enabledByDefault: false,
      },
    });
    sourceBookMap.set(src, book.id);
  }

  // 2. Purge ordonnée (backgrounds avant feats pour respecter la clé étrangère)
  console.log("🧹 Purge des anciennes données (backgrounds puis feats)...");
  await prisma.background.deleteMany();
  await prisma.feat.deleteMany();

  // 3. Préparation & insertion des Feats
  // Trier pour donner priorité à XPHB sur les slugs canoniques
  rawFeats.sort((a: any, b: any) => {
    if (a.source === "XPHB" && b.source !== "XPHB") return -1;
    if (b.source === "XPHB" && a.source !== "XPHB") return 1;
    return 0;
  });

  const usedFeatSlugs = new Set<string>();
  const featInsertData = rawFeats.map((f: any) => {
    const rawSource = f.source || "XPHB";
    const canonicalSlug = slugify(f.name);

    let finalSlug = canonicalSlug;
    if (usedFeatSlugs.has(canonicalSlug)) {
      finalSlug = slugify(`${f.name} ${rawSource}`);
      let counter = 1;
      while (usedFeatSlugs.has(finalSlug)) {
        finalSlug = `${slugify(`${f.name}${rawSource}`)}-${counter++}`;
      }
    }
    usedFeatSlugs.add(finalSlug);

    const { level, text: prereqText } = formatPrerequisites(f.prerequisite);
    const category = mapCategory(f.category, level);
    const description = parseEntries(f.entries || []);

    return {
      slug: finalSlug,
      name: f.name.trim(),
      source: rawSource,
      category,
      levelRequirement: level,
      prerequisite: prereqText,
      description: description || "Aucune description fournie.",
      repeatable: Boolean(f.repeatable),
      sourceBookId: sourceBookMap.get(rawSource) ?? null,
    };
  });

  console.log(`⚡ Insertion de ${featInsertData.length} dons...`);
  const featChunkSize = 100;
  for (let i = 0; i < featInsertData.length; i += featChunkSize) {
    const chunk = featInsertData.slice(i, i + featChunkSize);
    await prisma.feat.createMany({ data: chunk });
  }

  // Charger la map [slug -> id] des dons insérés
  const insertedFeats = await prisma.feat.findMany({ select: { id: true, slug: true } });
  const featSlugToId = new Map(insertedFeats.map((f) => [f.slug, f.id]));

  // 4. Préparation & insertion des Backgrounds
  const usedBgSlugs = new Set<string>();
  const bgInsertData = rawBackgrounds.map((b: any) => {
    const rawSource = b.source || "XPHB";
    const baseSlug = slugify(`${b.name} ${rawSource}`);
    let finalSlug = baseSlug;
    let counter = 1;

    while (usedBgSlugs.has(finalSlug)) {
      finalSlug = `${baseSlug}-${counter++}`;
    }
    usedBgSlugs.add(finalSlug);

    const featSlug = extractFeatSlugFromBackground(b.feats);
    const originFeatId = featSlug ? featSlugToId.get(featSlug) ?? null : null;

    return {
      slug: finalSlug,
      name: b.name.trim(),
      source: rawSource,
      page: b.page ? String(b.page) : null,
      description: parseEntries(b.entries || []),
      abilityChoices: extractAbilityChoices(b.ability),
      originFeatId,
      skillProficiencies: b.skillProficiencies || [],
      toolProficiencies: b.toolProficiencies || [],
      startingEquipment: b.startingEquipment || [],
      sourceBookId: sourceBookMap.get(rawSource) ?? null,
    };
  });

  console.log(`⚡ Insertion de ${bgInsertData.length} historiques...`);
  for (let i = 0; i < bgInsertData.length; i += featChunkSize) {
    const chunk = bgInsertData.slice(i, i + featChunkSize);
    await prisma.background.createMany({ data: chunk });
  }

  console.log("✅ Synchronisation complète des Feats et Backgrounds réussie !");
}

main()
  .catch((e) => {
    console.error("Erreur d'exécution :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });