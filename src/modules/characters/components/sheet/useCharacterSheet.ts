"use client";

import { useState, useEffect, useMemo, useTransition } from "react";
import {
  calculateModifier,
  calculateSkillBonuses,
  calculateSpellAttackBonus,
  calculateSpellSaveDc,
  type Ability,
  type AbilityScores,
  type Skill,
  type SkillProficiency,
} from "@/modules/characters/engine/dnd-rules-engine";
import {
  asiLevelsForClass,
  getMulticlassEligibility,
  validateLevelUpChoices,
} from "@/modules/characters/engine/class-progression-rules";
import { type DndThemeKey } from "@/styles/dnd-themes";
import {
  defaultScores,
  type CharacterSheetViewCharacter,
  type CharacterSpellEntry,
  type CharacterFeatEntry,
  type CharacterInventoryEntry,
  type CharacterNewSpellState,
  type CharacterNewFeatState,
  type CharacterNewItemState,
  type CharacterSheetUpdateData,
  type CharacterLevelUpData,
} from "@/modules/characters/components/sheet/shared";
import {
  type SubclassOption,
  type LevelUpFeatOption,
  type LevelUpSpellOption,
} from "@/modules/characters/components/sheet/CharacterLevelUpModal";
import {
  fetchSubclassesForClass,
  fetchAvailableFeats,
  fetchSpellsForLevelUp,
} from "@/modules/characters/server/subclass-service";

const validThemes = new Set<DndThemeKey>([
  "light", "dark", "barbarian", "bard", "cleric", "druid", "fighter",
  "monk", "paladin", "ranger", "rogue", "sorcerer", "warlock", "wizard", "artificer",
]);

const SPELLCASTER_KEYWORDS = [
  "magicien", "wizard", "magicienne", "ensorceleur", "sorcerer",
  "barde", "bard", "occultiste", "warlock", "clerc", "cleric",
  "druide", "druid", "paladin", "rôdeur", "ranger", "artificier", "artificer",
];

export function useCharacterSheet(
  character: CharacterSheetViewCharacter,
  onSave?: (data: CharacterSheetUpdateData) => Promise<void>,
  onLevelUp?: (data: CharacterLevelUpData) => Promise<void>,
  onToggleEquip?: (inventoryItemId: string) => Promise<void>
) {
  const scores = { ...defaultScores, ...character.abilityScores };
  const initialTheme = character.themeKey && validThemes.has(character.themeKey as DndThemeKey)
    ? (character.themeKey as DndThemeKey)
    : "light";

  const [theme, setTheme] = useState<DndThemeKey>(initialTheme);
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(character.name);
  const [draftClass, setDraftClass] = useState(character.className ?? "");
  const [draftSubclass, setDraftSubclass] = useState(character.subclassName ?? "");
  const [draftScores, setDraftScores] = useState<AbilityScores>(scores);
  const [proficiencies, setProficiencies] = useState<Partial<Record<Skill, SkillProficiency>>>(
    character.skillProficiencies ?? {}
  );
  const [hitPoints, setHitPoints] = useState(character.currentHitPoints ?? character.maxHitPoints ?? 1);
  const [temporaryHitPoints, setTemporaryHitPoints] = useState(character.temporaryHitPoints ?? 0);
  const [hitDice, setHitDice] = useState(character.level);
  const [inspiration, setInspiration] = useState(false);
  const [slots, setSlots] = useState([4, 3, 2, 0, 0, 0, 0, 0, 0]);
  const [activeTab, setActiveTab] = useState<"spellbook" | "feats" | "inventory" | "biography">("spellbook");

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("dnd_sheet_collapsed_sections");
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return { stats: false, skills: false, details: false };
  });

  useEffect(() => {
    try {
      localStorage.setItem("dnd_sheet_collapsed_sections", JSON.stringify(collapsed));
    } catch (e) {
      console.error(e);
    }
  }, [collapsed]);

  const toggleCollapsed = (section: string) => {
    setCollapsed((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const [draftSpells, setDraftSpells] = useState<CharacterSpellEntry[]>(
    (character.spells ?? []).map((s: any) => {
      const data = s.spell ?? s;
      return {
        id: data.id,
        name: data.name,
        level: data.level,
        school: data.school,
        range: data.range,
        castingTime: data.castingTime,
        components: data.components,
        concentration: data.concentration,
        description: data.description,
      };
    })
  );
  const [draftFeats, setDraftFeats] = useState<CharacterFeatEntry[]>(character.feats ?? []);
  const [draftInventory, setDraftInventory] = useState<CharacterInventoryEntry[]>(character.inventoryItems ?? []);

  const [newSpell, setNewSpell] = useState<CharacterNewSpellState>({
    name: "",
    level: 0,
    school: "Évocation",
    range: "18 m",
    castingTime: "1 action",
    components: "V, S",
    concentration: false,
    description: "",
  });
  const [newFeat, setNewFeat] = useState<CharacterNewFeatState>({ name: "", category: "GENERAL", description: "" });
  const [newItem, setNewItem] = useState<CharacterNewItemState>({
    name: "",
    category: "Équipement d'aventure",
    type: "GEAR",
    quantity: 1,
    weightLb: 1,
    costGp: 1,
    armorClass: 0,
  });

  const [biography, setBiography] = useState({
    personalityTraits: character.personalityTraits ?? "",
    ideals: character.ideals ?? "",
    bonds: character.bonds ?? "",
    flaws: character.flaws ?? "",
    appearance: character.appearance ?? "",
    backstory: character.backstory ?? "",
    alliesOrganizations: character.alliesOrganizations ?? "",
  });

  const [wealth, setWealth] = useState({
    copperPieces: character.copperPieces ?? 0,
    silverPieces: character.silverPieces ?? 0,
    electrumPieces: character.electrumPieces ?? 0,
    goldPieces: character.goldPieces ?? 0,
    platinumPieces: character.platinumPieces ?? 0,
  });

  // Modal LevelUp
  const [levelModal, setLevelModal] = useState(false);
  const [hitPointMethod, setHitPointMethod] = useState<"AVERAGE" | "ROLL">("AVERAGE");
  const [abilityIncrease, setAbilityIncrease] = useState<Partial<Record<Ability, number>>>({});
  const [feat, setFeat] = useState("");
  const [subclassId, setSubclassId] = useState("");
  const [newClassName, setNewClassName] = useState("");

  const [availableSubclasses, setAvailableSubclasses] = useState<SubclassOption[]>([]);
  const [availableFeats, setAvailableFeats] = useState<LevelUpFeatOption[]>([]);
  const [availableLevelUpSpells, setAvailableLevelUpSpells] = useState<LevelUpSpellOption[]>([]);
  const [selectedSpellIds, setSelectedSpellIds] = useState<string[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [equipPendingId, setEquipPendingId] = useState<string | null>(null);

  const hasSubclass = Boolean(
    character.subclassName ||
    character.subclassId ||
    (character as any).subclass?.name ||
    draftSubclass
  );
  const targetLevel = character.level + 1;
  const maxSpellLevel = Math.min(9, Math.ceil(targetLevel / 2));

  const isSpellcaster = useMemo(() => {
    const c = (character.className ?? "").toLowerCase();
    return Boolean(character.dndClass?.spellcastingAbility) || SPELLCASTER_KEYWORDS.some((k) => c.includes(k));
  }, [character.dndClass, character.className]);

  const spellSelectionCount = useMemo(() => {
    if (!isSpellcaster) return 0;
    const c = (character.className ?? "").toLowerCase();
    if (c.includes("magicien") || c.includes("wizard")) return 2;
    if (
      c.includes("ensorceleur") || c.includes("sorcerer") ||
      c.includes("barde") || c.includes("bard") ||
      c.includes("occultiste") || c.includes("warlock") ||
      c.includes("rôdeur") || c.includes("ranger")
    ) return 1;
    return 0;
  }, [isSpellcaster, character.className]);

  useEffect(() => {
    if (!levelModal || !character.className) return;

    if (targetLevel === 3 && !hasSubclass) {
      fetchSubclassesForClass(character.className)
        .then((data) => setAvailableSubclasses((data ?? []) as SubclassOption[]))
        .catch(() => setAvailableSubclasses([]));
    }

    fetchAvailableFeats()
      .then((data) => setAvailableFeats((data ?? []) as LevelUpFeatOption[]))
      .catch(() => setAvailableFeats([]));

    if (isSpellcaster) {
      fetchSpellsForLevelUp(character.className, targetLevel)
        .then((data) => setAvailableLevelUpSpells((data ?? []) as LevelUpSpellOption[]))
        .catch(() => setAvailableLevelUpSpells([]));
    }
  }, [levelModal, character.className, targetLevel, hasSubclass, isSpellcaster]);

  const displayedScores = editing ? draftScores : scores;
  const skillBonuses = calculateSkillBonuses(displayedScores, proficiencies, character.level);
  const maxHitPoints = character.maxHitPoints ?? 1;
  const abilityForSpellcasting: Ability = character.dndClass?.spellcastingAbility
    ? (character.dndClass.spellcastingAbility.toLowerCase() as Ability)
    : "intelligence";
  const spellcastingModifier = calculateModifier(displayedScores[abilityForSpellcasting] ?? 10);
  const spellSaveDc = calculateSpellSaveDc(spellcastingModifier, character.level);
  const spellAttackBonus = calculateSpellAttackBonus(spellcastingModifier, character.level);

  const activeSpells: CharacterSpellEntry[] = editing
    ? draftSpells
    : (character.spells ?? []).map((s: any) => (s.spell ?? s) as CharacterSpellEntry);
  const cantrips = activeSpells.filter((s) => s.level === 0);
  const leveledSpells = activeSpells
    .filter((s) => s.level > 0)
    .sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));

  const activeFeats = editing ? draftFeats : (character.feats ?? []);
  const activeInventory = editing ? draftInventory : (character.inventoryItems ?? []);
  const classFeaturesAtLevel = useMemo(
    () => (character.dndClass?.classFeatures ?? []).filter((f: { level: number }) => f.level <= character.level),
    [character.dndClass, character.level]
  );
  const legalAsiLevels = useMemo(
    () => [...asiLevelsForClass(character.className)] as number[],
    [character.className]
  );
  const multiclassEligibility = useMemo(
    () => getMulticlassEligibility(character.className, newClassName || null, displayedScores),
    [character.className, newClassName, displayedScores]
  );

  const cycleSkill = (skill: Skill) => {
    if (!editing) return;
    setProficiencies((current) => ({
      ...current,
      [skill]: current[skill] === undefined ? "PROFICIENT" : current[skill] === "PROFICIENT" ? "EXPERTISE" : "NONE",
    }));
  };

  const handleToggleEquip = (inventoryItemId: string) => {
    if (!onToggleEquip) return;
    setEquipPendingId(inventoryItemId);
    startTransition(async () => {
      try {
        await onToggleEquip(inventoryItemId);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Impossible de basculer l'équipement.");
      } finally {
        setEquipPendingId(null);
      }
    });
  };

  const saveChanges = () => {
    if (!onSave) return;
    startTransition(async () => {
      try {
        await onSave({
          name: draftName.trim(),
          class: draftClass.trim() || null,
          subclass: draftSubclass.trim() || null,
          ...draftScores,
          skillProficiencies: proficiencies,
          themeKey: theme,
          ...wealth,
          ...biography,
          spells: draftSpells,
          feats: draftFeats,
          inventoryItems: draftInventory,
        });
        setEditing(false);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Impossible d'enregistrer la fiche.");
      }
    });
  };

  const confirmLevelUp = () => {
    if (!onLevelUp) return;

    const validation = validateLevelUpChoices(character.className, character.level, {
      hitPointMethod,
      abilityIncrease,
      feat: feat.trim() || null,
      subclassId: subclassId.trim() || null,
      hasSubclass,
      newClassName: newClassName.trim() || null,
      spellIds: selectedSpellIds,
    });

    if (!validation.valid) {
      setError(validation.errors.join(" "));
      return;
    }

    startTransition(async () => {
      try {
        await onLevelUp({
          hitPointMethod,
          abilityIncrease,
          feat: feat.trim() || null,
          subclassId: subclassId.trim() || null,
          newClassName: newClassName.trim() || null,
          spellIds: selectedSpellIds,
        });
        setLevelModal(false);
        setError(null);
        setSelectedSpellIds([]);
        setSubclassId("");
        setFeat("");
        setAbilityIncrease({});
      } catch (err) {
        setError(err instanceof Error ? err.message : "Impossible de monter de niveau.");
      }
    });
  };

  return {
    theme, setTheme,
    editing, setEditing,
    draftName, setDraftName,
    draftClass, setDraftClass,
    draftSubclass, setDraftSubclass,
    draftScores, setDraftScores,
    displayedScores,
    hitPoints, setHitPoints, maxHitPoints,
    temporaryHitPoints, setTemporaryHitPoints,
    hitDice, setHitDice,
    inspiration, setInspiration,
    slots, setSlots,
    activeTab, setActiveTab,
    collapsed, toggleCollapsed,
    proficiencies, cycleSkill, skillBonuses,
    activeFeats, setDraftFeats, newFeat, setNewFeat, classFeaturesAtLevel,
    cantrips, leveledSpells, newSpell, setNewSpell, setDraftSpells,
    spellSaveDc, spellAttackBonus,
    activeInventory, setDraftInventory, newItem, setNewItem,
    equipPendingId, handleToggleEquip,
    wealth, setWealth,
    biography, setBiography,
    saveChanges,
    pending, error, setError,
    levelModal, setLevelModal,
    hitPointMethod, setHitPointMethod,
    abilityIncrease, setAbilityIncrease,
    feat, setFeat,
    subclassId, setSubclassId,
    newClassName, setNewClassName,
    availableSubclasses, availableFeats, availableLevelUpSpells,
    spellSelectionCount, maxSpellLevel,
    selectedSpellIds, setSelectedSpellIds,
    multiclassEligibility, legalAsiLevels, hasSubclass,
    confirmLevelUp,
  };
}