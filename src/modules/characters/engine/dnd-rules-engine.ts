export const ABILITIES = ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"] as const;
export type Ability = (typeof ABILITIES)[number];

export const SKILLS = ["acrobatics", "animalHandling", "arcana", "athletics", "deception", "history", "insight", "intimidation", "investigation", "medicine", "nature", "perception", "performance", "persuasion", "religion", "sleightOfHand", "stealth", "survival"] as const;
export type Skill = (typeof SKILLS)[number];
export type SkillProficiency = "NONE" | "PROFICIENT" | "EXPERTISE";
export type AbilityScores = Record<Ability, number>;
export type ProficiencyMap = Partial<Record<Skill, SkillProficiency>>;

export const SKILL_ABILITIES: Record<Skill, Ability> = {
  acrobatics: "dexterity",
  animalHandling: "wisdom",
  arcana: "intelligence",
  athletics: "strength",
  deception: "charisma",
  history: "intelligence",
  insight: "wisdom",
  intimidation: "charisma",
  investigation: "intelligence",
  medicine: "wisdom",
  nature: "intelligence",
  perception: "wisdom",
  performance: "charisma",
  persuasion: "charisma",
  religion: "intelligence",
  sleightOfHand: "dexterity",
  stealth: "dexterity",
  survival: "wisdom",
};

export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8] as const;
const POINT_BUY_COSTS: Record<number, number> = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };

export function calculateModifier(score: number) {
  return Math.floor((score - 10) / 2);
}

export function proficiencyBonus(level: number) {
  const safeLevel = Math.min(Math.max(Math.floor(level), 1), 20);
  return Math.floor((safeLevel - 1) / 4) + 2;
}

export function proficiencyValue(modifier: number, proficiency: SkillProficiency = "NONE", bonus: number) {
  return modifier + (proficiency === "EXPERTISE" ? bonus * 2 : proficiency === "PROFICIENT" ? bonus : 0);
}

export function calculateSkillBonuses(scores: AbilityScores, proficiencies: ProficiencyMap, level: number) {
  const bonus = proficiencyBonus(level);
  return Object.fromEntries(SKILLS.map((skill) => [skill, proficiencyValue(calculateModifier(scores[SKILL_ABILITIES[skill]]), proficiencies[skill], bonus)])) as Record<Skill, number>;
}

export function calculateSavingThrowBonuses(scores: AbilityScores, proficientAbilities: Ability[] = [], level: number) {
  const bonus = proficiencyBonus(level);
  return Object.fromEntries(ABILITIES.map((ability) => [ability, scores[ability] !== undefined ? calculateModifier(scores[ability]) + (proficientAbilities.includes(ability) ? bonus : 0) : 0])) as Record<Ability, number>;
}

export function pointBuyCost(scores: AbilityScores) {
  return ABILITIES.reduce((total, ability) => total + (POINT_BUY_COSTS[scores[ability]] ?? Number.POSITIVE_INFINITY), 0);
}

export function isValidPointBuy(scores: AbilityScores) {
  return ABILITIES.every((ability) => Number.isInteger(scores[ability]) && scores[ability] >= 8 && scores[ability] <= 15) && pointBuyCost(scores) <= 27;
}

export type ArmorCategory = "NONE" | "LIGHT" | "MEDIUM" | "HEAVY";
export type UnarmoredStyle = "NONE" | "BARBARIAN" | "MONK";

export function calculateArmorClass(options: { dexterityModifier: number; constitutionModifier?: number; wisdomModifier?: number; armorCategory?: ArmorCategory; armorBaseClass?: number; armorDexCap?: number | null; shieldBonus?: number; unarmoredStyle?: UnarmoredStyle }) {
  const shieldBonus = options.shieldBonus ?? 0;
  if (!options.armorCategory || options.armorCategory === "NONE") {
    const styleBonus = options.unarmoredStyle === "BARBARIAN" ? (options.constitutionModifier ?? 0) : options.unarmoredStyle === "MONK" ? (options.wisdomModifier ?? 0) : 0;
    return 10 + options.dexterityModifier + styleBonus + shieldBonus;
  }

  const baseClass = options.armorBaseClass ?? 10;
  const dexBonus = options.armorCategory === "HEAVY" ? 0 : Math.min(options.dexterityModifier, options.armorDexCap ?? (options.armorCategory === "MEDIUM" ? 2 : options.dexterityModifier));
  return baseClass + dexBonus + shieldBonus;
}

export function calculateMaxHitPoints(options: { level: number; hitDie: 6 | 8 | 10 | 12; constitutionModifier: number; speciesBonus?: number; rolledHitPoints?: number[] }) {
  const level = Math.min(Math.max(Math.floor(options.level), 1), 20);
  const averageAfterFirst = Math.ceil((options.hitDie + 1) / 2);
  const rolled = options.rolledHitPoints?.slice(0, Math.max(level - 1, 0)).reduce((total, value) => total + value, 0) ?? averageAfterFirst * Math.max(level - 1, 0);
  return options.hitDie + rolled + options.constitutionModifier * level + (options.speciesBonus ?? 0);
}

export function calculateSpellSaveDc(spellcastingModifier: number, level: number) {
  return 8 + proficiencyBonus(level) + spellcastingModifier;
}

export function calculateSpellAttackBonus(spellcastingModifier: number, level: number) {
  return proficiencyBonus(level) + spellcastingModifier;
}

const FULL_SPELL_SLOTS = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [2, 0, 0, 0, 0, 0, 0, 0, 0],
  [3, 0, 0, 0, 0, 0, 0, 0, 0],
  [4, 2, 0, 0, 0, 0, 0, 0, 0],
  [4, 3, 0, 0, 0, 0, 0, 0, 0],
  [4, 3, 2, 0, 0, 0, 0, 0, 0],
  [4, 3, 3, 0, 0, 0, 0, 0, 0],
  [4, 3, 3, 1, 0, 0, 0, 0, 0],
  [4, 3, 3, 2, 0, 0, 0, 0, 0],
  [4, 3, 3, 3, 1, 0, 0, 0, 0],
  [4, 3, 3, 3, 2, 0, 0, 0, 0],
  [4, 3, 3, 3, 2, 1, 0, 0, 0],
  [4, 3, 3, 3, 2, 1, 0, 0, 0],
  [4, 3, 3, 3, 2, 1, 1, 0, 0],
  [4, 3, 3, 3, 2, 1, 1, 0, 0],
  [4, 3, 3, 3, 2, 1, 1, 1, 0],
  [4, 3, 3, 3, 2, 1, 1, 1, 0],
  [4, 3, 3, 3, 2, 1, 1, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1, 1],
] as const;

export type SpellcastingProgression = "NONE" | "FULL" | "HALF" | "THIRD" | "PACT";

export function calculateSpellSlots(level: number, progression: SpellcastingProgression) {
  if (progression === "NONE") return [...FULL_SPELL_SLOTS[0]];
  const safeLevel = Math.min(Math.max(Math.floor(level), 1), 20);
  const effectiveLevel = progression === "FULL" ? safeLevel : progression === "HALF" ? Math.ceil(safeLevel / 2) : Math.ceil(safeLevel / 3);
  return [...(FULL_SPELL_SLOTS[effectiveLevel] ?? FULL_SPELL_SLOTS[FULL_SPELL_SLOTS.length - 1])];
}
