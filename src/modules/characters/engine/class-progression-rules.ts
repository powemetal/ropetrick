import { calculateSpellSlots, type SpellcastingProgression } from "@/modules/characters/engine/dnd-rules-engine";

export const STANDARD_ASI_LEVELS = [4, 8, 12, 16, 19] as const;
export const CLASS_ASI_LEVELS = {
  barbarian: [4, 8, 12, 16, 19],
  bard: STANDARD_ASI_LEVELS,
  cleric: STANDARD_ASI_LEVELS,
  druid: STANDARD_ASI_LEVELS,
  fighter: [4, 6, 8, 12, 14, 16, 19],
  monk: STANDARD_ASI_LEVELS,
  paladin: STANDARD_ASI_LEVELS,
  ranger: STANDARD_ASI_LEVELS,
  rogue: [4, 8, 10, 12, 16, 19],
  sorcerer: STANDARD_ASI_LEVELS,
  warlock: STANDARD_ASI_LEVELS,
  wizard: STANDARD_ASI_LEVELS,
  artificier: STANDARD_ASI_LEVELS,
} as const;

export type ProgressionClass = keyof typeof CLASS_ASI_LEVELS;
export type AbilityIncrease = Partial<Record<"strength" | "dexterity" | "constitution" | "intelligence" | "wisdom" | "charisma", number>>;

export const CLASS_NAMES: Record<string, ProgressionClass> = {
  Barbare: "barbarian",
  Barde: "bard",
  Clerc: "cleric",
  Druide: "druid",
  Guerrier: "fighter",
  Moine: "monk",
  Paladin: "paladin",
  Rôdeur: "ranger",
  Roublard: "rogue",
  Ensorceleur: "sorcerer",
  Occultiste: "warlock",
  Magicien: "wizard",
  Magicienne: "wizard",
  Artificier: "artificier",
};

export const MULTICLASS_REQUIREMENTS: Record<string, Partial<Record<"strength" | "dexterity" | "constitution" | "intelligence" | "wisdom" | "charisma", number>>> = {
  Barbare: { strength: 13 },
  Barde: { charisma: 13 },
  Clerc: { wisdom: 13 },
  Druide: { wisdom: 13 },
  Guerrier: { strength: 13 },
  Moine: { dexterity: 13, wisdom: 13 },
  Paladin: { strength: 13, charisma: 13 },
  Rôdeur: { dexterity: 13, wisdom: 13 },
  Roublard: { dexterity: 13 },
  Ensorceleur: { charisma: 13 },
  Occultiste: { charisma: 13 },
  Magicien: { intelligence: 13 },
  Artificier: { intelligence: 13 },
};

export function progressionClass(value: string | null | undefined): ProgressionClass | null {
  if (!value) return null;
  return CLASS_NAMES[value] ?? (Object.hasOwn(CLASS_ASI_LEVELS, value.toLowerCase()) ? (value.toLowerCase() as ProgressionClass) : null);
}

export function asiLevelsForClass(className: string | null | undefined) {
  return CLASS_ASI_LEVELS[progressionClass(className) ?? "fighter"];
}

export function hasAbilityOrFeatChoice(className: string | null | undefined, level: number) {
  return asiLevelsForClass(className).includes(level as never);
}

export function getMulticlassEligibility(currentClassName: string | null | undefined, nextClassName: string | null | undefined, scores: Partial<Record<"strength" | "dexterity" | "constitution" | "intelligence" | "wisdom" | "charisma", number>>) {
  const currentRequirements = currentClassName ? (MULTICLASS_REQUIREMENTS[progressionClass(currentClassName) ?? ""] ?? MULTICLASS_REQUIREMENTS[currentClassName] ?? {}) : {};
  const nextRequirements = nextClassName ? (MULTICLASS_REQUIREMENTS[progressionClass(nextClassName) ?? ""] ?? MULTICLASS_REQUIREMENTS[nextClassName] ?? {}) : {};
  const checks = [
    { name: currentClassName ?? "Classe actuelle", requirements: currentRequirements },
    { name: nextClassName ?? "Nouvelle classe", requirements: nextRequirements },
  ].filter((entry) => Object.keys(entry.requirements).length > 0);

  const missing: string[] = [];
  for (const entry of checks) {
    for (const [ability, minimum] of Object.entries(entry.requirements)) {
      const score = scores[ability as keyof typeof scores] ?? 0;
      if (score < (minimum ?? 0)) {
        missing.push(`${entry.name} exige ${ability.toUpperCase()} ${minimum}.`);
      }
    }
  }

  if (currentClassName && nextClassName && currentClassName === nextClassName) {
    return { eligible: true, reasons: [] };
  }

  return {
    eligible: missing.length === 0,
    reasons: missing,
  };
}

const LEVEL_UP_SPELL_SELECTIONS: Record<ProgressionClass, number> = {
  barbarian: 0,
  bard: 1,
  cleric: 0,
  druid: 0,
  fighter: 0,
  monk: 0,
  paladin: 0,
  ranger: 1,
  rogue: 0,
  sorcerer: 1,
  warlock: 1,
  wizard: 2,
  artificier: 0,
};

// RÈGLE STRICTE : La sous-classe est TOUJOURS et UNIQUEMENT au niveau 3
export function subclassLevelRequirementForClass(_className: string | null | undefined) {
  return 3;
}

export function spellSelectionCountForClass(className: string | null | undefined) {
  return LEVEL_UP_SPELL_SELECTIONS[progressionClass(className) ?? "fighter"] ?? 0;
}

export function maxSpellLevelForProgression(level: number, progression: SpellcastingProgression | null | undefined) {
  const slots = calculateSpellSlots(level, progression ?? "NONE");
  for (let slotLevel = slots.length - 1; slotLevel >= 0; slotLevel -= 1) {
    if (slots[slotLevel] > 0) return slotLevel + 1;
  }
  return 0;
}

export type LevelUpChoices = {
  hitPointMethod?: "AVERAGE" | "ROLL";
  abilityIncrease?: AbilityIncrease;
  feat?: string | null;
  subclassId?: string | null;
  newClassName?: string | null;
  hasSubclass?: boolean;
  availableSpellCount?: number;
  spellIds?: string[];
  preparedSpells?: string[];
};

export function validateLevelUpChoices(className: string | null | undefined, currentLevel: number, choices: LevelUpChoices) {
  const nextLevel = currentLevel + 1;
  const errors: string[] = [];

  if (currentLevel < 1 || currentLevel >= 20) {
    errors.push("Le personnage doit être entre les niveaux 1 et 19 pour progresser.");
  }

  if (!choices.hitPointMethod) {
    errors.push("Choisissez la moyenne officielle ou le tirage du dé de vie.");
  }

  // SOUS-CLASSE : strictement au niveau 3 de la classe principale
  const isMulticlassing = Boolean(choices.newClassName && choices.newClassName.trim());
  if (nextLevel === 3 && !choices.hasSubclass && !isMulticlassing && !choices.subclassId?.trim()) {
    errors.push("Une sous-classe doit être sélectionnée au niveau 3.");
  }

  // ASI (Augmentation de caractéristiques) / Don
  const abilityIncreases = Object.values(choices.abilityIncrease ?? {}).map((val) => val ?? 0);
  const hasNegativeValues = abilityIncreases.some((val) => val < 0);
  const positiveIncreases = abilityIncreases.filter((val) => val > 0);
  const totalAsiPoints = positiveIncreases.reduce((sum, val) => sum + val, 0);
  const hasFeat = Boolean(choices.feat && choices.feat.trim());
  const legalAsiLevel = hasAbilityOrFeatChoice(className, nextLevel);

  if (legalAsiLevel) {
    if (hasFeat && totalAsiPoints > 0) {
      errors.push("Choisissez soit une augmentation de caractéristiques, soit un don, pas les deux.");
    } else if (!hasFeat) {
      const isValidDistribution = !hasNegativeValues && ((positiveIncreases.length === 1 && positiveIncreases[0] === 2) || (positiveIncreases.length === 2 && positiveIncreases.every((val) => val === 1)));

      if (!isValidDistribution) {
        errors.push("L'augmentation de caractéristiques exige soit +2 dans une caractéristique, soit +1 dans deux caractéristiques distinctes.");
      }
    }
  } else if (hasFeat || totalAsiPoints > 0) {
    errors.push("Les dons et augmentations de caractéristiques sont interdits pour ce niveau.");
  }

  // SORTS : validation des quotas et des doublons
  const cleanSpellIds = (choices.spellIds ?? []).map((id) => id.trim()).filter(Boolean);
  const uniqueSpellIds = new Set(cleanSpellIds);
  const requiredSpellCount = spellSelectionCountForClass(className);
  const canValidateSpellSelection = choices.availableSpellCount === undefined ? true : choices.availableSpellCount >= requiredSpellCount;

  if (cleanSpellIds.length !== uniqueSpellIds.size) {
    errors.push("Un même sort ne peut pas être sélectionné plusieurs fois.");
  }

  if (canValidateSpellSelection && requiredSpellCount > 0 && cleanSpellIds.length > 0 && cleanSpellIds.length !== requiredSpellCount) {
    errors.push(`Sélectionnez exactement ${requiredSpellCount} sort${requiredSpellCount > 1 ? "s" : ""} pour ce niveau.`);
  }

  if ((choices.preparedSpells ?? []).some((spell) => !spell.trim())) {
    errors.push("Les sorts préparés doivent être renseignés sans valeur vide.");
  }

  return { valid: errors.length === 0, errors };
}
