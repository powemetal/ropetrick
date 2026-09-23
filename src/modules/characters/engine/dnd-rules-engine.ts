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

/**
 * Calcule le bonus d'attaque et la formule de dégâts complète d'une arme
 */
export function calculateWeaponStats(options: {
  weapon: any;
  strengthModifier: number;
  dexterityModifier: number;
  level: number;
  isProficient?: boolean;
}) {
  const { weapon, strengthModifier, dexterityModifier, level, isProficient = true } = options;
  const subItem = weapon.item ?? weapon;
  const system = subItem.system ?? subItem;

  // 1. Bonus de maîtrise garanti si isProficient est vrai
  const profBonus = isProficient ? proficiencyBonus(level) : 0;

  // 2. Propriétés de l'arme (finesse, distance, etc.)
  const properties = Array.isArray(system.properties) 
    ? system.properties 
    : Object.keys(system.properties ?? {});
  
  const isFinesse = properties.includes("fin") || properties.includes("finesse");
  const isRanged = system.type === "ranged" || system.range?.units === "ft" || properties.includes("range");

  // Si c'est une arme de corps à corps classique, on prend la Force. Si finesse/distance, le max entre Force et Dex.
  const abilityMod = (isFinesse || isRanged)
    ? Math.max(strengthModifier, dexterityModifier)
    : strengthModifier;

  // 3. Détection du bonus magique (ex: "+1" dans system.magicalBonus ou dans le nom)
  let magicalBonus = Number(system.magicalBonus ?? subItem.magicalBonus ?? 0);
  if (!magicalBonus && (subItem.name || system.name)) {
    const itemName = subItem.name || system.name;
    const match = itemName.match(/\+(\d+)/);
    if (match) magicalBonus = parseInt(match[1], 10);
  }

  // 4. Calcul total du Bonus d'Attaque : Caractéristique + Maîtrise + Bonus magique de l'arme
  const attackBonus = abilityMod + profBonus + magicalBonus;
  const formattedAttackBonus = attackBonus >= 0 ? `+${attackBonus}` : `${attackBonus}`;

  // 5. Formule de dégâts (Le bonus de caractéristique et le bonus magique s'appliquent aux dégâts, mais pas le bonus de maîtrise)
  const baseDamageObj = system.damage?.base;
  const diceNum = baseDamageObj?.number ?? 1;
  const diceDenom = baseDamageObj?.denomination ?? 6;
  const baseDamageDice = `${diceNum}d${diceDenom}`;

  const damageTypesArr = baseDamageObj?.types;
  const damageType = Array.isArray(damageTypesArr) && damageTypesArr.length > 0 
    ? damageTypesArr[0] 
    : (system.damageType || "");

  let damageParts = [baseDamageDice];
  if (abilityMod !== 0) {
    damageParts.push(abilityMod > 0 ? `+ ${abilityMod}` : `- ${Math.abs(abilityMod)}`);
  }
  if (magicalBonus > 0) {
    damageParts.push(`+ ${magicalBonus}`);
  }

  const damageFormula = damageParts.join(" ");

  // Détail textuel explicatif pour afficher aux joueurs (ex: "+4 Carac + 3 Maîtrise + 1 Magique")
  const formattedAbilityMod = abilityMod >= 0 ? `+${abilityMod}` : `${abilityMod}`;
  const breakdown = `${formattedAbilityMod} (Carac) + ${profBonus} (Maîtrise) + ${magicalBonus} (Magique)`;

  return {
    attackBonus: formattedAttackBonus,
    damageFormula,
    damageType,
    abilityMod,
    magicalBonus,
    profBonus,
    breakdown,
  };
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

export function calculatePassivePerception(
  skillBonuses: Record<Skill, number>,
  hasAdvantage: boolean = false,
  hasDisadvantage: boolean = false
) {
  let score = 10 + (skillBonuses.perception ?? 0);
  if (hasAdvantage) score += 5;
  if (hasDisadvantage) score -= 5;
  return score;
}

export function calculatePassiveInsight(
  skillBonuses: Record<Skill, number>,
  hasAdvantage: boolean = false,
  hasDisadvantage: boolean = false
) {
  let score = 10 + (skillBonuses.insight ?? 0);
  if (hasAdvantage) score += 5;
  if (hasDisadvantage) score -= 5;
  return score;
}

export function calculatePassiveInvestigation(
  skillBonuses: Record<Skill, number>,
  hasAdvantage: boolean = false,
  hasDisadvantage: boolean = false
) {
  let score = 10 + (skillBonuses.investigation ?? 0);
  if (hasAdvantage) score += 5;
  if (hasDisadvantage) score -= 5;
  return score;
}

export type EncumbranceStatus = "NORMAL" | "ENCUMBERED" | "HEAVILY_ENCUMBERED" | "OVER_CAPACITY";

export function calculateEncumbrance(strength: number, totalWeightLb: number) {
  const carryingCapacity = strength * 15;
  const encumberedThreshold = strength * 5;
  const heavilyEncumberedThreshold = strength * 10;

  let status: EncumbranceStatus = "NORMAL";
  let speedPenalty = 0;
  let hasDisadvantage = false;

  if (totalWeightLb > carryingCapacity) {
    status = "OVER_CAPACITY";
    speedPenalty = -999;
    hasDisadvantage = true;
  } else if (totalWeightLb > heavilyEncumberedThreshold) {
    status = "HEAVILY_ENCUMBERED";
    speedPenalty = 20;
    hasDisadvantage = true;
  } else if (totalWeightLb > encumberedThreshold) {
    status = "ENCUMBERED";
    speedPenalty = 10;
  }

  return {
    totalWeightLb,
    carryingCapacity,
    encumberedThreshold,
    heavilyEncumberedThreshold,
    status,
    speedPenalty,
    hasDisadvantage,
    isOverCapacity: totalWeightLb > carryingCapacity,
  };
}

export type MovementSpeeds = {
  walking: number;
  fly?: number;
  swim?: number;
  climb?: number;
};

export function calculateMovementSpeed(options: {
  baseSpeciesSpeed: number;
  classBonus?: number;
  featBonus?: number;
  speedPenalty?: number;
  alternativeSpeeds?: {
    fly?: number;
    swim?: number;
    climb?: number;
  };
}): MovementSpeeds {
  const penalty = options.speedPenalty ?? 0;
  
  if (penalty <= -900) {
    return {
      walking: 0,
      fly: 0,
      swim: 0,
      climb: 0,
    };
  }

  const rawWalking = options.baseSpeciesSpeed + (options.classBonus ?? 0) + (options.featBonus ?? 0) - penalty;
  const walking = Math.max(rawWalking, 0);

  return {
    walking,
    fly: options.alternativeSpeeds?.fly,
    swim: options.alternativeSpeeds?.swim,
    climb: options.alternativeSpeeds?.climb,
  };
}