import { prisma, findClassFiles, slugify, mapAbilityScore, mapCasterProgression } from "./helpers";
import * as fs from "fs";
import * as path from "path";

export async function seedClassesAndSubclasses() {
  const classFiles = findClassFiles();
  if (classFiles.length === 0) return;

  const classesData: any[] = [];
  const subclassesData: any[] = [];

  console.log(`⏳ Analyse des fichiers de classes (${classFiles.length} fichiers)...`);
  
  for (const filePath of classFiles) {
    const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    
    // 1. Préparation des données de classes
    for (const c of (raw.class || [])) {
      if (!c.name) continue;
      const source = c.source || "XPHB";
      const baseSlug = slugify(`${c.name}-${source}`);

      let hitDie = c.hd?.faces || c.hd || 8;
      let spellSlotProgression = null;
      if (Array.isArray(c.classTableGroups)) {
        const spellGroup = c.classTableGroups.find((g: any) => g.rowsSpellProgression || g.title?.toLowerCase().includes("spell slots"));
        if (spellGroup?.rowsSpellProgression) spellSlotProgression = spellGroup.rowsSpellProgression;
      }

      classesData.push({
        slug: baseSlug,
        name: c.name,
        source, // Utilisé temporairement pour le mapping des sous-classes, ignoré par Prisma si non mappé
        hitDie,
        spellcastingAbility: mapAbilityScore(c.spellcastingAbility),
        spellcastingProgression: mapCasterProgression(c.casterProgression),
        savingThrows: Array.isArray(c.proficiency) ? c.proficiency : [],
        cantripProgression: Array.isArray(c.cantripProgression) ? c.cantripProgression : [],
        preparedSpellsProgression: Array.isArray(c.preparedSpellsProgression) ? c.preparedSpellsProgression : [],
        spellSlotProgression,
        classTableGroups: c.classTableGroups || null,
        description: c.entries ? JSON.stringify(c.entries) : "",
      });
    }

    // 2. Collecte brute des sous-classes
    if (Array.isArray(raw.subclass)) {
      for (const sc of raw.subclass) {
        subclassesData.push({ raw: sc, sourceFile: path.basename(filePath) });
      }
    }
  }

  // Insertion massive des classes en une seule requête SQL
  console.log(`⏳ Insertion en masse de ${classesData.length} classes...`);
  await prisma.dndClass.createMany({
    data: classesData.map(({ source, ...rest }) => rest), // On retire le champ temporaire 'source'
    skipDuplicates: true,
  });

  // Récupération rapide de toutes les classes insérées pour mapper leurs IDs
  const insertedClasses = await prisma.dndClass.findMany({ select: { id: true, slug: true, name: true } });
  const classMap = new Map<string, string>();
  for (const cls of insertedClasses) {
    classMap.set(cls.slug, cls.id);
    classMap.set(cls.name.toLowerCase(), cls.id);
  }

  // Préparation des données de sous-classes avec les bons IDs de liaison
  const finalSubclassesData: any[] = [];
  for (const item of subclassesData) {
    const sc = item.raw;
    if (!sc.name) continue;
    const source = sc.source || "XPHB";
    const parentClassName = (sc.className || sc.class || "").trim().toLowerCase();
    
    const parentClassId = classMap.get(parentClassName) || classMap.get(slugify(parentClassName));
    if (!parentClassId) continue;

    const baseSlug = slugify(`${parentClassName}-${sc.name}-${source}`);

    finalSubclassesData.push({
      slug: baseSlug,
      name: sc.name,
      shortName: sc.shortName || sc.name,
      dndClassId: parentClassId,
      spellcastingAbility: mapAbilityScore(sc.spellcastingAbility),
      additionalSpells: sc.additionalSpells || null,
      description: sc.entries ? JSON.stringify(sc.entries) : "",
    });
  }

  // Insertion massive des sous-classes en une seule requête SQL
  console.log(`⏳ Insertion en masse de ${finalSubclassesData.length} sous-classes...`);
  if (finalSubclassesData.length > 0) {
    await prisma.dndSubclass.createMany({
      data: finalSubclassesData,
      skipDuplicates: true,
    });
  }

  console.log("✅ Classes et sous-classes insérées instantanément !");
}