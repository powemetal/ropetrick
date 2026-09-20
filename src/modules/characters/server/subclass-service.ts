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

// 2. Récupération des dons (Feats)
export async function fetchAvailableFeats() {
  try {
    // Si tu as un modèle de dons dans Prisma (ex: dndFeat ou feat) :
    // Remplace par prisma.dndFeat ou le nom exact si présent.
    const feats = await (prisma as any).dndFeat?.findMany({
      select: {
        id: true,
        name: true,
        description: true,
      },
      orderBy: { name: "asc" },
    });

    if (feats && feats.length > 0) return feats;

    // Fallback : Dons officiels D&D 5e si la table est vide ou n'existe pas encore
    return [
      { id: "feat-sharpshooter", name: "Tireur d'élite", description: "Attaques à distance ignorant les abris partiels et pénalité de -5 pour +10 aux dégâts." },
      { id: "feat-sentinel", name: "Sentinelle", description: "Réduit la vitesse ennemie à 0 lors d'attaques d'opportunité." },
      { id: "feat-polearm-master", name: "Maître d'hast", description: "Attaque d'opportunité quand un ennemi entre à portée et frappe bonus." },
      { id: "feat-great-weapon-master", name: "Maître des armes lourdes", description: "Attaque bonus après un coup critique et option -5 au toucher pour +10 dégâts." },
      { id: "feat-lucky", name: "Chanceux", description: "3 points de chance pour relancer des d20 d'attaques, tests ou sauvegardes." },
      { id: "feat-war-caster", name: "Mage de combat", description: "Avantage aux jets de concentration et sorts en réaction d'opportunité." },
      { id: "feat-alert", name: "Vigilant", description: "+5 à l'initiative et immunité à la surprise." },
      { id: "feat-resilient", name: "Résistant", description: "+1 à une caractéristique et maîtrise de ses jets de sauvegarde." },
      { id: "feat-fey-touched", name: "Touché par la Féerie", description: "+1 en Int/Sag/Cha et sort Foulée brumeuse une fois par repos long." },
      { id: "feat-shadow-touched", name: "Touché par les Ombres", description: "+1 en Int/Sag/Cha et sort Invisibilité une fois par repos long." },
    ];
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
