import type { Ability, AbilityScores, Skill, SkillProficiency } from "@/modules/characters/engine/dnd-rules-engine";

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
  themeKey: string;
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
  spells?: SheetSpell[];
  feats?: SheetFeat[];
  inventoryItems?: SheetInventoryItem[];
};

export type CharacterLevelUpData = {
  hitPointMethod: "AVERAGE" | "ROLL";
  abilityIncrease?: Partial<Record<Ability, number>>;
  feat?: string | null;
  subclassId?: string | null;
};

export type SheetSpell = {
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

export type SheetFeat = {
  id: string;
  name: string;
  category: string;
  description: string;
};

export type SheetItem = {
  id: string;
  name: string;
  category: string;
  type: string | null;
  costGp: number | null;
  weightLb: number | null;
  armorClass: number | null;
};

export type SheetInventoryItem = {
  id: string;
  quantity: number;
  isEquipped: boolean;
  item: SheetItem;
};

export type RawCharacterData = {
  name: string;
  className?: string | null;
  subclassName?: string | null;
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
  spells?: {
    id: string;
    name: string;
    level: number;
    school: string;
    range: string;
    castingTime: string;
    components: unknown;
    concentration: boolean;
    description: string;
    spell?: SheetSpell;
  }[];
  inventoryItems?: SheetInventoryItem[];
  dndClass?: {
    spellcastingAbility?: string | null;
    classFeatures: { id: string; level: number; name: string; description: string }[];
  } | null;
  originFeat?: SheetFeat | null;
  feats?: SheetFeat[];
};