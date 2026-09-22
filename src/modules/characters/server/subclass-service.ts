"use server";

import { prisma } from "@/lib/prisma";
import { CLASS_NAMES, progressionClass } from "@/modules/characters/engine/class-progression-rules";

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();

function buildClassAliases(className: string) {
  const slug = progressionClass(className);
  const aliases = new Set<string>([normalize(className)]);

  if (slug) {
    aliases.add(normalize(slug));
    for (const [label, mappedSlug] of Object.entries(CLASS_NAMES)) {
      if (mappedSlug === slug) aliases.add(normalize(label));
    }
  }

  return aliases;
}

// 1. Récupération des sous-classes
export async function fetchSubclassesForClass(className: string) {
  try {
    const subclasses = await prisma.dndSubclass.findMany({
      where: {
        dndClass: {
          OR: [{ name: { contains: className.trim(), mode: "insensitive" } }, { slug: { contains: className.trim().toLowerCase() } }],
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
      },
      orderBy: { name: "asc" },
    });
    return subclasses;
  } catch (error) {
    console.error("Erreur chargement sous-classes:", error);
    return [];
  }
}

// 2. Récupération des dons (Feats) directement depuis la table feats
export async function fetchAvailableFeats() {
  try {
    const feats = await prisma.feat.findMany({
      select: {
        id: true,
        name: true,
        category: true, // <--- Ajoute cette ligne ici !
        description: true,
        prerequisite: true,
      },
      orderBy: { name: "asc" },
    });
    
    return feats;
  } catch (error) {
    console.error("Erreur chargement dons:", error);
    return [];
  }
}

// 3. Récupération des sorts éligibles pour le level-up
export async function fetchSpellsForLevelUp(className: string, targetLevel: number) {
  try {
    const maxSpellLevel = Math.min(9, Math.ceil(targetLevel / 2));
    const classAliases = buildClassAliases(className);

    const spells = await prisma.spell.findMany({
      where: {
        level: {
          gte: 1,
          lte: maxSpellLevel,
        },
      },
      select: {
        id: true,
        name: true,
        level: true,
        school: true,
        description: true,
        classes: true,
      },
      orderBy: [{ level: "asc" }, { name: "asc" }],
    });

    return spells
      .filter((spell) => {
        const spellClasses = Array.isArray(spell.classes) ? spell.classes.filter((entry): entry is string => typeof entry === "string") : [];

        if (spellClasses.length === 0) return true;
        return spellClasses.some((entry) => classAliases.has(normalize(entry)));
      })
      .map((spell) => ({
        id: spell.id,
        name: spell.name,
        level: spell.level,
        school: spell.school,
        description: spell.description,
      }));
  } catch (error) {
    console.error("Erreur chargement sorts level-up:", error);
    return [];
  }
}

export async function fetchAvailableSpells() {
  try {
    const spells = await prisma.spell.findMany({
      select: {
        id: true,
        name: true,
        level: true,
        school: true,
        range: true,
        castingTime: true,
        components: true,
        concentration: true,
        description: true,
      },
      orderBy: [{ level: "asc" }, { name: "asc" }],
    });
    return spells;
  } catch (error) {
    console.error("Erreur chargement sorts:", error);
    return [];
  }
}