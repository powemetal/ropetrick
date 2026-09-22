import {
  PrismaClient,
  CreatureSize,
  ItemType,
  ArmorCategory,
} from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function resolveDataFile(filename: string): string | null {
  const possiblePaths = [
    path.join(__dirname, "data", filename),
    path.join(__dirname, filename),
    path.join(process.cwd(), "prisma", "data", filename),
    path.join(process.cwd(), "data", filename),
    path.join(process.cwd(), filename),
  ];
  return possiblePaths.find((p) => fs.existsSync(p)) || null;
}

async function getOrCreateSourceBook(code: string, title?: string) {
  const cleanCode = (code || "XPHB").toUpperCase();
  return prisma.sourceBook.upsert({
    where: { code: cleanCode },
    update: {},
    create: {
      code: cleanCode,
      title: title || `${cleanCode} Sourcebook`,
      isOfficial: true,
      enabledByDefault: cleanCode === "XPHB" || cleanCode === "PHB",
    },
  });
}

async function main() {
  console.log("🚀 Début du seed du Compendium...");

  // 1. SourceBook par défaut
  const defaultBook = await getOrCreateSourceBook(
    "XPHB",
    "Player's Handbook (2024 / SRD 5.2)"
  );

  // 2. Weapon Mastery Properties (2024 Rules)
  console.log("⏳ Traitement des propriétés de Weapon Mastery...");
  const masteryDefinitions = [
    { code: "CLEAVE", name: "Cleave", description: "Make a melee attack against a second creature within 5 ft." },
    { code: "GRAZE", name: "Graze", description: "Deal ability modifier damage on a miss." },
    { code: "NICK", name: "Nick", description: "Make the Light extra attack as part of the Attack action." },
    { code: "PUSH", name: "Push", description: "Push a creature up to 10 feet away." },
    { code: "SAP", name: "Sap", description: "Disadvantage on the target's next attack roll." },
    { code: "SLOW", name: "Slow", description: "Reduce target speed by 10 feet." },
    { code: "TOPPLE", name: "Topple", description: "Force a Constitution save or knock the target prone." },
    { code: "VEX", name: "Vex", description: "Advantage on your next attack roll against that target." },
  ];

  const masteryMap = new Map<string, string>();
  for (const m of masteryDefinitions) {
    const record = await prisma.weaponMasteryProperty.upsert({
      where: { code: m.code },
      update: { name: m.name, description: m.description },
      create: { code: m.code, name: m.name, description: m.description },
    });
    masteryMap.set(m.name.toLowerCase(), record.id);
    masteryMap.set(m.code.toLowerCase(), record.id);
  }
  console.log("✅ Weapon Masteries insérées.");

  // 3. Langues (languages.json)
  const langPath = resolveDataFile("languages.json");
  if (langPath) {
    const raw = JSON.parse(fs.readFileSync(langPath, "utf-8"));
    const languages = raw.language || [];
    console.log(`⏳ Traitement de ${languages.length} entrées de langues...`);

    for (const lang of languages) {
      if (!lang.name) continue;
      const isExotic =
        lang.type === "exotic" ||
        lang.type === "rare" ||
        lang.type === "secret";

      await prisma.language.upsert({
        where: { name: lang.name },
        update: {
          script: typeof lang.script === "string" ? lang.script : "Common",
          isExotic,
        },
        create: {
          name: lang.name,
          script: typeof lang.script === "string" ? lang.script : "Common",
          isExotic,
        },
      });
    }
    console.log("✅ Langues insérées.");
  }

  // 4. Dons / Feats (feats.json)
  const featMap = new Map<string, string>();
  const featsPath = resolveDataFile("feats.json");
  if (featsPath) {
    const raw = JSON.parse(fs.readFileSync(featsPath, "utf-8"));
    const feats = raw.feat || [];
    console.log(`⏳ Traitement de ${feats.length} dons...`);

    for (const f of feats) {
      if (!f.name) continue;
      const source = f.source || "XPHB";
      const baseSlug = slugify(`${f.name}-${source}`);
      const book = await getOrCreateSourceBook(source);

      let levelRequirement = 0;
      if (Array.isArray(f.prerequisite)) {
        for (const prereq of f.prerequisite) {
          if (typeof prereq.level === "number") {
            levelRequirement = prereq.level;
            break;
          }
        }
      }

      const description = f.entries ? JSON.stringify(f.entries) : "";

      const featRecord = await prisma.feat.upsert({
        where: { slug: baseSlug },
        update: {
          name: f.name,
          category: f.category || null,
          levelRequirement,
          description,
          sourceBookId: book.id,
        },
        create: {
          slug: baseSlug,
          name: f.name,
          category: f.category || null,
          levelRequirement,
          description,
          sourceBookId: book.id,
        },
      });

      featMap.set(f.name.toLowerCase(), featRecord.id);
      featMap.set(slugify(f.name), featRecord.id);
    }
    console.log("✅ Dons insérés.");
  }

  // 5. Races / Espèces (races.json)
  const racesPath = resolveDataFile("races.json");
  if (racesPath) {
    const raw = JSON.parse(fs.readFileSync(racesPath, "utf-8"));
    const races = raw.race || [];
    console.log(`⏳ Traitement de ${races.length} races/espèces...`);

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

      await prisma.species.upsert({
        where: { slug: baseSlug },
        update: {
          name: r.name,
          speed,
          size,
          darkvision: typeof r.darkvision === "number" ? r.darkvision : null,
          traits: r.entries || [],
          sourceBookId: book.id,
        },
        create: {
          slug: baseSlug,
          name: r.name,
          speed,
          size,
          darkvision: typeof r.darkvision === "number" ? r.darkvision : null,
          traits: r.entries || [],
          sourceBookId: book.id,
        },
      });
    }
    console.log("✅ Races/Espèces insérées.");
  }

  // 6. Historiques (backgrounds.json)
  const bgPath = resolveDataFile("backgrounds.json");
  if (bgPath) {
    const raw = JSON.parse(fs.readFileSync(bgPath, "utf-8"));
    const backgrounds = raw.background || [];
    console.log(`⏳ Traitement de ${backgrounds.length} historiques...`);

    for (const bg of backgrounds) {
      if (!bg.name) continue;
      const source = bg.source || "XPHB";
      const baseSlug = slugify(`${bg.name}-${source}`);
      const book = await getOrCreateSourceBook(source);

      let originFeatId: string | null = null;
      if (Array.isArray(bg.feats)) {
        for (const featEntry of bg.feats) {
          const rawFeatKey = Object.keys(featEntry)[0] || "";
          const featNameOnly = rawFeatKey.split("|")[0].trim().toLowerCase();
          if (featMap.has(featNameOnly)) {
            originFeatId = featMap.get(featNameOnly)!;
            break;
          }
        }
      }

      await prisma.background.upsert({
        where: { slug: baseSlug },
        update: {
          name: bg.name,
          source,
          originFeatId,
          skillProficiencies: bg.skillProficiencies || [],
          toolProficiencies: bg.toolProficiencies || [],
          startingEquipment: bg.startingEquipment || [],
          description: bg.entries ? JSON.stringify(bg.entries) : null,
          sourceBookId: book.id,
        },
        create: {
          slug: baseSlug,
          name: bg.name,
          source,
          originFeatId,
          skillProficiencies: bg.skillProficiencies || [],
          toolProficiencies: bg.toolProficiencies || [],
          startingEquipment: bg.startingEquipment || [],
          description: bg.entries ? JSON.stringify(bg.entries) : null,
          sourceBookId: book.id,
        },
      });
    }
    console.log("✅ Backgrounds insérés.");
  }

  // 7. Items de base & Armes (items-base.json)
  const baseItemsPath = resolveDataFile("items-base.json");
  if (baseItemsPath) {
    const raw = JSON.parse(fs.readFileSync(baseItemsPath, "utf-8"));
    const items = raw.baseitem || [];
    console.log(`⏳ Traitement de ${items.length} items de base/armes/armures...`);

    for (const it of items) {
      if (!it.name) continue;
      const source = it.source || "XPHB";
      const baseSlug = slugify(`${it.name}-${source}`);
      const book = await getOrCreateSourceBook(source);

      const rawCode = (it.type || "").split("|")[0].trim().toUpperCase();

      let type: ItemType = ItemType.GEAR;
      let armorCategory: ArmorCategory = ArmorCategory.NONE;

      if (rawCode === "LA") {
        type = ItemType.ARMOR;
        armorCategory = ArmorCategory.LIGHT;
      } else if (rawCode === "MA") {
        type = ItemType.ARMOR;
        armorCategory = ArmorCategory.MEDIUM;
      } else if (rawCode === "HA") {
        type = ItemType.ARMOR;
        armorCategory = ArmorCategory.HEAVY;
      } else if (rawCode === "S" || it.name.toLowerCase().includes("shield")) {
        type = ItemType.SHIELD;
        armorCategory = ArmorCategory.SHIELD;
      } else if (rawCode === "M" || rawCode === "R" || it.weapon) {
        type = ItemType.WEAPON;
      } else if (
        rawCode === "AT" ||
        rawCode === "INS" ||
        rawCode === "T" ||
        rawCode === "GS"
      ) {
        type = ItemType.TOOL;
      } else if (rawCode === "A" || rawCode === "AF") {
        type = ItemType.GEAR;
      }

      let masteryPropertyId: string | null = null;
      if (Array.isArray(it.mastery) && it.mastery.length > 0) {
        const rawMastery = it.mastery[0].split("|")[0].trim().toLowerCase();
        if (masteryMap.has(rawMastery)) {
          masteryPropertyId = masteryMap.get(rawMastery)!;
        }
      }

      let damageType: string | null = null;
      if (it.dmgType === "S") damageType = "slashing";
      else if (it.dmgType === "P") damageType = "piercing";
      else if (it.dmgType === "B") damageType = "bludgeoning";

      await prisma.equipmentItem.upsert({
        where: { slug: baseSlug },
        update: {
          name: it.name,
          category: it.weaponCategory || it.type || "gear",
          description: JSON.stringify(it.entries || []),
          type,
          armorCategory,
          armorClass: typeof it.ac === "number" ? it.ac : null,
          damageFormula: it.dmg1 || null,
          damageType,
          properties: Array.isArray(it.property) ? it.property : [],
          weightLb: typeof it.weight === "number" ? it.weight : null,
          costCp: typeof it.value === "number" ? Math.round(it.value) : null,
          masteryPropertyId,
          sourceBookId: book.id,
        },
        create: {
          slug: baseSlug,
          name: it.name,
          category: it.weaponCategory || it.type || "gear",
          description: JSON.stringify(it.entries || []),
          type,
          armorCategory,
          armorClass: typeof it.ac === "number" ? it.ac : null,
          damageFormula: it.dmg1 || null,
          damageType,
          properties: Array.isArray(it.property) ? it.property : [],
          weightLb: typeof it.weight === "number" ? it.weight : null,
          costCp: typeof it.value === "number" ? Math.round(it.value) : null,
          masteryPropertyId,
          sourceBookId: book.id,
        },
      });
    }
    console.log("✅ Items de base insérés.");
  }

  console.log("🎉 Seed terminé avec succès !");
}

main()
  .catch((e) => {
    console.error("❌ Erreur pendant le seed :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });