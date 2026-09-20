import type { Ability, AbilityScores, Skill, SkillProficiency, SpellcastingProgression } from "@/modules/characters/engine/dnd-rules-engine";
import type { DndThemeKey } from "@/styles/dnd-themes";


export const abilityLabels: Record<Ability, string> = {
  strength: "FOR",
  dexterity: "DEX",
  constitution: "CON",
  intelligence: "INT",
  wisdom: "SAG",
  charisma: "CHA",
};

export const skillLabels: Record<Skill, string> = {
  acrobatics: "Acrobaties",
  animalHandling: "Dressage",
  arcana: "Arcanes",
  athletics: "Athlétisme",
  deception: "Tromperie",
  history: "Histoire",
  insight: "Perspicacité",
  intimidation: "Intimidation",
  investigation: "Investigation",
  medicine: "Médecine",
  nature: "Nature",
  perception: "Perception",
  performance: "Représentation",
  persuasion: "Persuasion",
  religion: "Religion",
  sleightOfHand: "Escamotage",
  stealth: "Discrétion",
  survival: "Survie",
};

export const defaultScores: AbilityScores = { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 };
export const validThemes = new Set<DndThemeKey>(["light", "dark", "barbarian", "bard", "cleric", "druid", "fighter", "monk", "paladin", "ranger", "rogue", "sorcerer", "warlock", "wizard", "artificer"]);
export const skillCodeFor = (value: string) => value.replace(/([a-z])([A-Z])/g, "$1_$2").toUpperCase();

export type CharacterSpellEntry = {
  id: string;
  name: string;
  level: number;
  school: string;
  range: string;
  castingTime: string;
  components: unknown;
  concentration: boolean;
  description: string;
  spell?: {
    id: string;
    name: string;
    level: number;
    school: string;
    range: string;
    castingTime: string;
    components: unknown;
    concentration: boolean;
    description: string;
  };
};

export type CharacterFeatEntry = { id: string; name: string; category: string; description: string };

export type CharacterInventoryEntry = {
  id: string;
  quantity: number;
  isEquipped: boolean;
  item: {
    id: string;
    name: string;
    category: string;
    type: string | null;
    costGp: number | null;
    weightLb: number | null;
    armorClass: number | null;
  };
};

export type CharacterBiographyState = {
  personalityTraits: string;
  ideals: string;
  bonds: string;
  flaws: string;
  appearance: string;
  backstory: string;
  alliesOrganizations: string;
};

export type CharacterNewSpellState = {
  name: string;
  level: number;
  school: string;
  range: string;
  castingTime: string;
  components: string;
  concentration: boolean;
  description: string;
};

export type CharacterNewFeatState = {
  name: string;
  category: string;
  description: string;
};

export type CharacterNewItemState = {
  name: string;
  category: string;
  type: string;
  quantity: number;
  weightLb: number;
  costGp: number;
  armorClass: number;
};

export type CharacterSheetViewCharacter = {
  name: string;
  className?: string | null;
  subclassName?: string | null;
  subclassId?: string | null;
  backgroundName?: string | null;
  level: number;
  abilityScores?: Partial<AbilityScores>;
  skillProficiencies?: Partial<Record<Skill, SkillProficiency>>;
  currentHitPoints?: number;
  maxHitPoints?: number;
  temporaryHitPoints?: number;
  armorClass?: number;
  initiative?: number;
  speed?: number;
  hitDie?: number;
  themeKey?: string | null;
  skillDefinitions?: { code: string; name: string; description: string; examples: string }[];
  copperPieces?: number;
  silverPieces?: number;
  electrumPieces?: number;
  goldPieces?: number;
  platinumPieces?: number;
  personalityTraits?: string | null;
  ideals?: string | null;
  bonds?: string | null;
  flaws?: string | null;
  appearance?: string | null;
  backstory?: string | null;
  alliesOrganizations?: string | null;
  spells?: CharacterSpellEntry[];
  inventoryItems?: CharacterInventoryEntry[];
  dndClass?: { id?: string; slug?: string; spellcastingAbility?: string | null; spellcastingProgression?: SpellcastingProgression | null; classFeatures: { id: string; level: number; name: string; description: string }[] } | null;
  dndSubclass?: { id: string; name: string; description?: string | null } | null;
  originFeat?: { id: string; name: string; category: string; description: string } | null;
  feats?: CharacterFeatEntry[];
};

export type LevelUpFeatOption = {
  id: string;
  name: string;
  description: string;
  prerequisite?: string | null;
};

export type LevelUpSpellOption = {
  id: string;
  name: string;
  level: number;
  school: string;
  range: string;
  castingTime: string;
  description: string;
  classes: string[];
};

export type CharacterSheetUpdateData = {
  name: string;
  class: string | null;
  subclass: string | null;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  skillProficiencies: Partial<Record<Skill, SkillProficiency>>;
  themeKey?: string;
  notebookTheme?: string;
  copperPieces?: number;
  silverPieces?: number;
  electrumPieces?: number;
  goldPieces?: number;
  platinumPieces?: number;
  personalityTraits?: string | null;
  ideals?: string | null;
  bonds?: string | null;
  flaws?: string | null;
  appearance?: string | null;
  backstory?: string | null;
  alliesOrganizations?: string | null;
  spells?: CharacterSpellEntry[];
  feats?: CharacterFeatEntry[];
  inventoryItems?: CharacterInventoryEntry[];
};

export type CharacterLevelUpData = {
  hitPointMethod: "AVERAGE" | "ROLL";
  abilityIncrease?: Partial<Record<Ability, number>>;
  feat?: string | null;
  subclassId?: string | null;
  newClassName?: string | null;
  spellIds?: string[];
};