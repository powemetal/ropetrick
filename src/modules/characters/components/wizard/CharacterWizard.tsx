"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { calculateArmorClass, calculateMaxHitPoints, calculateModifier, isValidPointBuy, pointBuyCost, STANDARD_ARRAY, type Ability, type AbilityScores } from "@/modules/characters/engine/dnd-rules-engine";
import { ThemeSelector } from "@/modules/characters/components/ThemeSelector";
import { themeStyle, type DndThemeKey } from "@/styles/dnd-themes";
import { CompendiumTooltip } from "@/components/ui/CompendiumTooltip";
import { isRedirectError } from "next/dist/client/components/redirect-error";

const abilities: { key: Ability; label: string }[] = [
  { key: "strength", label: "Force" },
  { key: "dexterity", label: "Dextérité" },
  { key: "constitution", label: "Constitution" },
  { key: "intelligence", label: "Intelligence" },
  { key: "wisdom", label: "Sagesse" },
  { key: "charisma", label: "Charisme" },
];
const classes = ["Barbare", "Barde", "Clerc", "Druide", "Guerrier", "Moine", "Paladin", "Rôdeur", "Roublard", "Ensorceleur", "Occultiste", "Magicien", "Artificier"];
const classThemes: Record<string, DndThemeKey> = { Barbare: "barbarian", Barde: "bard", Clerc: "cleric", Druide: "druid", Guerrier: "fighter", Moine: "monk", Paladin: "paladin", Rôdeur: "ranger", Roublard: "rogue", Ensorceleur: "sorcerer", Occultiste: "warlock", Magicien: "wizard", Artificier: "artificer" };
const emptyScores: AbilityScores = { strength: 8, dexterity: 8, constitution: 8, intelligence: 8, wisdom: 8, charisma: 8 };
const asStringArray = (value: unknown) => (Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []);
const skillCodeFor = (value: string) => value.replace(/([a-z])([A-Z])/g, "$1_$2").toUpperCase();

export type CharacterWizardData = {
  name: string;
  race: string;
  speciesId?: string;
  subspeciesId?: string | null;
  backgroundId?: string;
  dndClassId?: string;
  class: string;
  subclass: string | null;
  subclassId?: string | null;
  level: number;
  stats: Record<string, unknown>;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  maxHitPoints: number;
  currentHitPoints: number;
  hitDie: 6 | 8 | 10 | 12;
  speed: number;
  themeKey: string;
  skillProficiencies: Record<string, "NONE" | "PROFICIENT" | "EXPERTISE">;
  spellIds: string[];
  selectedSpellIds: string[];
  selectedWeaponMasteryIds: string[];
  selectedLanguageIds: string[];
  startingEquipmentIds: string[];
  copperPieces: number;
  silverPieces: number;
  electrumPieces: number;
  goldPieces: number;
  platinumPieces: number;
};

export type SpeciesWizardOption = {
  id: string;
  name: string;
  slug: string;
  speed: number;
  size: string;
  darkvision: number | null;
  traits: unknown;
  subspecies: { id: string; slug: string; name: string; speed: number | null; traits: unknown }[];
};

export type BackgroundWizardOption = { id: string; slug: string; name: string; abilityChoices: unknown; originFeat: { id: string; name: string; description: string } | null; skillProficiencies: unknown };
export type ClassWizardOption = { id: string; slug: string; name: string; hitDie: number; skillChoices: number; skillOptions: unknown; subclasses: { id: string; slug: string; name: string }[] };
export type SpellWizardOption = { id: string; slug: string; name: string; level: number; school: string; castingTime: string; range: string; components: unknown; duration: string; description: string; ritual: boolean; concentration: boolean; classes: unknown };
export type SkillDefinitionOption = { id: string; code: string; name: string; ability: string; description: string; examples: string };
export type WeaponMasteryOption = { id: string; code: string; name: string; description: string };
export type EquipmentWizardOption = { id: string; slug: string; name: string; type: string | null; category: string; costGp: number | null; weightLb: number | null; damageFormula: string | null; damageType: string | null; properties: string[]; masteryPropertyId: string | null; armorCategory: string | null; armorClass: number | null; dexterityBonusMax: number | null; shieldBonus: number | null };
export type LanguageWizardOption = { id: string; name: string; script: string; isExotic: boolean };
export type ClassFeatureWizardOption = { id: string; dndClassId: string; name: string; description: string };
export type CharacterCreationCompendium = { species: SpeciesWizardOption[]; backgrounds: BackgroundWizardOption[]; classes: ClassWizardOption[]; spells: SpellWizardOption[]; skills: SkillDefinitionOption[]; weaponMasteries: WeaponMasteryOption[]; equipment: EquipmentWizardOption[]; languages: LanguageWizardOption[]; classFeatures: ClassFeatureWizardOption[] };

type CharacterWizardProps = { compendium: CharacterCreationCompendium; onSubmit?: (data: CharacterWizardData) => Promise<void> };

export function CharacterWizard({ compendium, onSubmit }: CharacterWizardProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [speciesId, setSpeciesId] = useState(compendium.species[0]?.id ?? "");
  const [subspeciesId, setSubspeciesId] = useState("");
  const [backgroundId, setBackgroundId] = useState(compendium.backgrounds[0]?.id ?? "");
  const [dndClassId, setDndClassId] = useState(compendium.classes.find((option) => option.slug === "fighter")?.id ?? compendium.classes[0]?.id ?? "");
  const [subclassId, setSubclassId] = useState("");
  const [theme, setTheme] = useState<DndThemeKey>("fighter");
  const [scores, setScores] = useState<AbilityScores>(emptyScores);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedSpellIds, setSelectedSpellIds] = useState<string[]>([]);
  const [selectedWeaponMasteryIds, setSelectedWeaponMasteryIds] = useState<string[]>([]);
  const [selectedLanguageIds, setSelectedLanguageIds] = useState<string[]>([]);
  const [startingEquipmentIds, setStartingEquipmentIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const selectedSpecies = compendium.species.find((option) => option.id === speciesId) ?? compendium.species[0];
  const selectedBackground = compendium.backgrounds.find((option) => option.id === backgroundId) ?? compendium.backgrounds[0];
  const selectedClass = compendium.classes.find((option) => option.id === dndClassId) ?? compendium.classes[0];
  const characterClass = selectedClass?.name ?? "Classe non disponible";
  const activeTheme = classThemes[characterClass] ?? classThemes[selectedClass?.slug ?? ""] ?? theme;
  const currentTheme = theme === "fighter" && selectedClass?.slug !== "fighter" ? activeTheme : theme;
  const species = selectedSpecies?.name ?? "Espèce non disponible";
  const background = selectedBackground?.name ?? "Historique non disponible";
  const backgroundSkills = useMemo(() => asStringArray(selectedBackground?.skillProficiencies), [selectedBackground]);
  const classSkills = useMemo(() => asStringArray(selectedClass?.skillOptions), [selectedClass]);
  const availableSkills = useMemo(() => [...new Set([...backgroundSkills, ...classSkills])].map((code) => compendium.skills.find((skill) => skill.code === skillCodeFor(code)) ?? { code, name: code, description: "Description indisponible.", examples: "", ability: "" }), [backgroundSkills, classSkills, compendium.skills]);
  const skillQuota = 2 + (selectedClass?.skillChoices ?? 0);
  const hp = calculateMaxHitPoints({ level: 1, hitDie: (selectedClass?.hitDie ?? 8) as 6 | 8 | 10 | 12, constitutionModifier: calculateModifier(scores.constitution) });
  const spellcastingClasses = new Set(["Barde", "Clerc", "Druide", "Ensorceleur", "Magicien", "Occultiste"]);
  const spellSelectionRequired = Boolean(selectedClass && spellcastingClasses.has(selectedClass.name));
  const spellQuota = useMemo(() => {
    if (!selectedClass) return { cantrips: 0, levelOne: 0, prepared: false };
    if (selectedClass.slug === "wizard") return { cantrips: 3, levelOne: 6, prepared: false };
    if (selectedClass.slug === "cleric" || selectedClass.slug === "druid") return { cantrips: 3, levelOne: Math.max(1, calculateModifier(scores.wisdom) + 1), prepared: true };
    if (selectedClass.slug === "sorcerer") return { cantrips: 4, levelOne: 2, prepared: false };
    if (selectedClass.slug === "warlock") return { cantrips: 2, levelOne: 2, prepared: false };
    return { cantrips: 2, levelOne: 4, prepared: false };
  }, [scores.wisdom, selectedClass]);
  const availableSpells = useMemo(() => compendium.spells.filter((spell) => spell.level <= 1 && (asStringArray(spell.classes).length === 0 || asStringArray(spell.classes).includes(selectedClass?.slug ?? ""))), [compendium.spells, selectedClass]);
  const availableCantrips = useMemo(() => availableSpells.filter((spell) => spell.level === 0), [availableSpells]);
  const availableLevelOneSpells = useMemo(() => availableSpells.filter((spell) => spell.level === 1), [availableSpells]);
  const selectedCantripCount = selectedSpellIds.filter((id) => compendium.spells.find((spell) => spell.id === id)?.level === 0).length;
  const selectedLevelOneCount = selectedSpellIds.filter((id) => compendium.spells.find((spell) => spell.id === id)?.level === 1).length;
  const spellQuotasMet = !spellSelectionRequired || (selectedCantripCount === spellQuota.cantrips && selectedLevelOneCount === spellQuota.levelOne);
  const weaponMasteryQuota = selectedClass?.slug === "fighter" ? 3 : ["barbarian", "paladin", "ranger", "rogue"].includes(selectedClass?.slug ?? "") ? 2 : 0;
  const martialClass = weaponMasteryQuota > 0;
  const classLevelOneFeatures = useMemo(() => (selectedClass ? compendium.classFeatures.filter((feature) => feature.dndClassId === selectedClass.id) : []), [compendium.classFeatures, selectedClass]);
  const selectedCantrips = useMemo(() => compendium.spells.filter((spell) => spell.level === 0 && selectedSpellIds.includes(spell.id)), [compendium.spells, selectedSpellIds]);
  const selectedLevelOneSpells = useMemo(() => compendium.spells.filter((spell) => spell.level === 1 && selectedSpellIds.includes(spell.id)), [compendium.spells, selectedSpellIds]);
  const selectedWeaponMasteries = useMemo(() => compendium.weaponMasteries.filter((mastery) => selectedWeaponMasteryIds.includes(mastery.id)), [compendium.weaponMasteries, selectedWeaponMasteryIds]);
  const selectedEquipmentItems = useMemo(() => compendium.equipment.filter((item) => startingEquipmentIds.includes(item.id)), [compendium.equipment, startingEquipmentIds]);
  const componentsLabel = (components: unknown) => asStringArray(components).join(", ") || "Aucune";
  const startingCopperPieces = 0;
  const startingSilverPieces = 0;
  const startingElectrumPieces = 0;
  const startingGoldPieces = 0;
  const startingPlatinumPieces = 0;
  const availableWeapons = useMemo(() => compendium.equipment.filter((item) => item.type === "WEAPON" && item.masteryPropertyId), [compendium.equipment]);
  const startingArmorClass = useMemo(() => {
    const armor = compendium.equipment.find((item) => startingEquipmentIds.includes(item.id) && item.type === "ARMOR");
    const shield = compendium.equipment.find((item) => startingEquipmentIds.includes(item.id) && item.type === "SHIELD");
    return calculateArmorClass({ dexterityModifier: calculateModifier(scores.dexterity), armorCategory: (armor?.armorCategory ?? "NONE") as "NONE" | "LIGHT" | "MEDIUM" | "HEAVY", armorBaseClass: armor?.armorClass ?? undefined, armorDexCap: armor?.dexterityBonusMax, shieldBonus: shield?.shieldBonus ?? 0 });
  }, [compendium.equipment, scores.dexterity, startingEquipmentIds]);
  const speciesPanel = useMemo(() => {
    const traits = Array.isArray(selectedSpecies?.traits) ? selectedSpecies.traits : [];
    return {
      name: selectedSpecies?.name ?? "Espèce",
      description: traits.length > 0 ? (typeof traits[0] === "object" && traits[0] && "description" in traits[0] ? String((traits[0] as { description?: string }).description ?? "") : "") : "Description disponible dans le compendium officiel.",
      traits: traits.map((trait) => ({ name: typeof trait === "object" && trait && "name" in trait ? String((trait as { name?: string }).name ?? "") : "Trait", description: typeof trait === "object" && trait && "description" in trait ? String((trait as { description?: string }).description ?? "") : "" })),
    };
  }, [selectedSpecies]);
  const backgroundPanel = useMemo(
    () => ({
      name: selectedBackground?.name ?? "Historique",
      description: selectedBackground ? `Historique de ${selectedBackground.name}. Les compétences, équipement et aptitude d'origine sont intégrées dans la création. ` : "Historique non disponible.",
      traits: selectedBackground
        ? [
            { name: "Compétences", description: asStringArray(selectedBackground.skillProficiencies).join(", ") || "Aucune" },
            { name: "Don d'origine", description: selectedBackground.originFeat ? `${selectedBackground.originFeat.name} — ${selectedBackground.originFeat.description}` : "Aucun" },
          ]
        : [],
    }),
    [selectedBackground],
  );
  const classPanel = useMemo(
    () => ({
      name: selectedClass?.name ?? "Classe",
      description: selectedClass ? `${selectedClass.name} · d${selectedClass.hitDie}.` : "Classe non disponible.",
      traits: selectedClass
        ? [
            { name: "Compétences", description: asStringArray(selectedClass.skillOptions).join(", ") || "Aucune" },
            { name: "Sous-classes", description: selectedClass.subclasses.map((option) => option.name).join(", ") || "Aucune" },
          ]
        : [],
    }),
    [selectedClass],
  );

  useEffect(() => {
    setSelectedSkills((current) => {
      const next = current.filter((skill) => availableSkills.some((definition) => definition.code === skill)).slice(0, skillQuota);
      return next.length === current.length && next.every((skill, index) => skill === current[index]) ? current : next;
    });
  }, [availableSkills, skillQuota]);

  useEffect(() => {
    if (step !== 5 || selectedSkills.length === skillQuota) {
      setError(null);
    }
  }, [step, selectedSkills.length, skillQuota]);

  const updateScore = (ability: Ability, value: number) => {
    const next = { ...scores, [ability]: value };
    if (isValidPointBuy(next) || pointBuyCost(next) <= 27) setScores(next);
  };
  const hitDie = (selectedClass?.hitDie ?? 8) as 6 | 8 | 10 | 12;
  const nextStep = () => {
    if (step === 1 && !name.trim()) {
      setError("Un nom de personnage est requis pour continuer.");
      return;
    }
    if (step === 1 && selectedLanguageIds.length < 1) {
      setError("Sélectionnez au moins une langue de départ.");
      return;
    }
    if (step === 5 && selectedSkills.length !== skillQuota) {
      setError(`Sélectionnez exactement ${skillQuota} compétences (2 d'historique et ${selectedClass?.skillChoices ?? 0} de classe).`);
      return;
    }
    if (step === 5 && spellSelectionRequired && (selectedCantripCount !== spellQuota.cantrips || selectedLevelOneCount !== spellQuota.levelOne)) {
      setError(`Sélectionnez exactement ${spellQuota.cantrips} tours de magie et ${spellQuota.levelOne} sorts de niveau 1.`);
      return;
    }
    if (step === 5 && martialClass && selectedWeaponMasteryIds.length !== weaponMasteryQuota) {
      setError(`Sélectionnez exactement ${weaponMasteryQuota} maîtrises d'armes.`);
      return;
    }
    if (step < 6) {
      setStep((current) => current + 1);
      return;
    }
    if (!onSubmit || !name.trim()) {
      setError("Un nom de personnage est requis.");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await onSubmit({ name: name.trim(), race: species, speciesId: selectedSpecies?.id, subspeciesId: subspeciesId || null, backgroundId: selectedBackground?.id, dndClassId: selectedClass?.id, class: characterClass, subclass: null, subclassId: null, level: 1, stats: { hitPoints: { current: hp, max: hp }, armorClass: startingArmorClass, speed: { walk: selectedSpecies?.speed ?? 30 } }, ...scores, maxHitPoints: hp, currentHitPoints: hp, hitDie, speed: selectedSpecies?.speed ?? 30, themeKey: currentTheme, skillProficiencies: Object.fromEntries(selectedSkills.map((skill) => [skill, "PROFICIENT"])), spellIds: selectedSpellIds, selectedSpellIds, selectedWeaponMasteryIds, selectedLanguageIds, startingEquipmentIds, copperPieces: startingCopperPieces, silverPieces: startingSilverPieces, electrumPieces: startingElectrumPieces, goldPieces: startingGoldPieces, platinumPieces: startingPlatinumPieces });
      } catch (submitError) {
        if (isRedirectError(submitError)) throw submitError;
        setError(submitError instanceof Error ? submitError.message : "Impossible de créer le personnage.");
      }
    });
  };

  return (
    <section className="rounded-xl border p-5 shadow-sm" style={{ ...themeStyle(currentTheme), background: "var(--dnd-background)", color: "var(--dnd-ink)", borderColor: "var(--dnd-accent-soft)" }}>
      <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-5" style={{ borderColor: "var(--dnd-accent-soft)" }}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--dnd-accent)" }}>
            Créateur guidé
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Nouvelle aventure</h2>
        </div>
        <ThemeSelector value={currentTheme} onChange={setTheme} />
      </div>
      <div className="mt-5 flex flex-wrap gap-2" aria-label="Étapes de création">
        {["Identité", "Historique", "Classe", "Caractéristiques", "Compétences", "Validation"].map((label, index) => (
          <button key={label} type="button" onClick={() => setStep(index + 1)} className="rounded-full px-3 py-1 text-xs font-medium" style={{ background: step === index + 1 ? "var(--dnd-accent)" : "var(--dnd-surface)", color: step === index + 1 ? "#fff" : "var(--dnd-muted)" }}>
            {index + 1}. {label}
          </button>
        ))}
      </div>

      <div className="mt-7 min-h-56">
        {step === 1 && (
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="grid gap-2 text-sm">
              Nom
              <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nom du personnage" className="rounded-md border bg-transparent px-3 py-2" style={{ borderColor: "var(--dnd-accent-soft)" }} />
            </label>
            <label className="grid gap-2 text-sm">
              Espèce
              <select
                value={speciesId}
                onChange={(event) => {
                  setSpeciesId(event.target.value);
                  setSubspeciesId("");
                }}
                className="rounded-md border bg-transparent px-3 py-2"
                style={{ borderColor: "var(--dnd-accent-soft)", color: "var(--dnd-ink)" }}
              >
                {compendium.species.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </label>
            {selectedSpecies && selectedSpecies.subspecies.length > 0 && (
              <label className="grid gap-2 text-sm">
                Lignée / sous-espèce
                <select value={subspeciesId} onChange={(event) => setSubspeciesId(event.target.value)} className="rounded-md border bg-transparent px-3 py-2" style={{ borderColor: "var(--dnd-accent-soft)", color: "var(--dnd-ink)" }}>
                  <option value="">Aucune préférence</option>
                  {selectedSpecies.subspecies.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <p className="sm:col-span-2 text-sm" style={{ color: "var(--dnd-muted)" }}>
              Vitesse {selectedSpecies?.speed ?? 30} ft · Taille {selectedSpecies?.size ?? "Medium"} · {selectedSpecies?.darkvision ? `Vision dans le noir ${selectedSpecies.darkvision} ft · ` : ""}Traits d&apos;espèce appliqués à la validation.
            </p>
            <fieldset className="sm:col-span-2 rounded-lg border p-4" style={{ borderColor: "var(--dnd-accent-soft)", background: "var(--dnd-surface)" }}>
              <legend className="px-2 text-sm font-semibold">Langues de départ · {selectedLanguageIds.length}/1</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {compendium.languages.map((language) => (
                  <label key={language.id} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={selectedLanguageIds.includes(language.id)} disabled={!selectedLanguageIds.includes(language.id) && selectedLanguageIds.length >= 1} onChange={() => setSelectedLanguageIds((current) => (current.includes(language.id) ? current.filter((id) => id !== language.id) : [...current, language.id]))} />
                    {language.name}{" "}
                    <span className="text-xs" style={{ color: "var(--dnd-muted)" }}>
                      ({language.script})
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        )}
        {step === 2 && (
          <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
            <label className="grid gap-2 text-sm">
              Historique
              <select
                value={backgroundId}
                onChange={(event) => {
                  setBackgroundId(event.target.value);
                  setSelectedSkills([]);
                }}
                className="rounded-md border bg-transparent px-3 py-2"
                style={{ borderColor: "var(--dnd-accent-soft)", color: "var(--dnd-ink)" }}
              >
                {compendium.backgrounds.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="rounded-lg p-4" style={{ background: "var(--dnd-surface)" }}>
              <p className="text-sm font-semibold">Don d&apos;origine</p>
              <p className="mt-2 text-sm" style={{ color: "var(--dnd-muted)" }}>
                {selectedBackground?.originFeat ? `Don d'origine : ${selectedBackground.originFeat.name}. ` : ""}+2/+1 ou +1/+1/+1 parmi les trois caractéristiques de l&apos;historique.
              </p>
            </div>
            <div className="lg:col-span-2 rounded-lg border p-4" style={{ borderColor: "var(--dnd-accent-soft)", background: "var(--dnd-surface)" }}>
              <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--dnd-accent)" }}>
                Description officielle
              </p>
              <h3 className="mt-2 text-lg font-semibold">{backgroundPanel.name}</h3>
              <p className="mt-2 text-sm leading-6" style={{ color: "var(--dnd-muted)" }}>
                {backgroundPanel.description}
              </p>
              {backgroundPanel.traits.map((trait) => (
                <div key={trait.name} className="mt-3 rounded-md border p-2" style={{ borderColor: "var(--dnd-accent-soft)" }}>
                  <p className="text-sm font-semibold">{trait.name}</p>
                  <p className="mt-1 text-xs leading-5" style={{ color: "var(--dnd-muted)" }}>
                    {trait.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {compendium.classes.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setDndClassId(item.id);
                    setSubclassId("");
                    setSelectedSkills([]);
                    setTheme(classThemes[item.name] ?? classThemes[item.slug] ?? theme);
                  }}
                  className="rounded-lg border p-4 text-left transition hover:-translate-y-0.5"
                  style={{ borderColor: selectedClass?.id === item.id ? "var(--dnd-accent)" : "var(--dnd-accent-soft)", background: selectedClass?.id === item.id ? "var(--dnd-accent-soft)" : "var(--dnd-surface)" }}
                >
                  <span className="font-medium">{item.name}</span>
                  <span className="mt-1 block text-xs" style={{ color: "var(--dnd-muted)" }}>
                    d{item.hitDie} · {item.skillChoices} compétences
                  </span>
                </button>
              ))}
            </div>
            <div className="rounded-lg border p-4" style={{ borderColor: "var(--dnd-accent-soft)", background: "var(--dnd-surface)" }}>
              <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--dnd-accent)" }}>
                Description officielle
              </p>
              <h3 className="mt-2 text-xl font-semibold">{classPanel.name}</h3>
              <p className="mt-2 text-sm leading-6" style={{ color: "var(--dnd-muted)" }}>
                {classPanel.description}
              </p>
              {classPanel.traits.map((trait) => (
                <div key={trait.name} className="mt-3 rounded-md border p-2" style={{ borderColor: "var(--dnd-accent-soft)" }}>
                  <p className="text-sm font-semibold">{trait.name}</p>
                  <p className="mt-1 text-xs leading-5" style={{ color: "var(--dnd-muted)" }}>
                    {trait.description}
                  </p>
                </div>
              ))}
              {selectedClass?.subclasses.length ? (
                <p className="mt-4 rounded-md border p-3 text-sm" style={{ borderColor: "var(--dnd-accent-soft)", color: "var(--dnd-muted)" }}>
                  Sous-classe verrouillée au niveau 1. Disponible au niveau 3.
                </p>
              ) : null}
            </div>
          </div>
        )}
        {step === 4 && (
          <div>
            <div className="mb-4 flex items-center justify-between text-sm">
              <span>Point Buy · 27 points</span>
              <strong style={{ color: pointBuyCost(scores) <= 27 ? "var(--dnd-accent)" : "#ef4444" }}>{27 - pointBuyCost(scores)} restants</strong>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {abilities.map(({ key, label }) => (
                <label key={key} className="rounded-lg p-3" style={{ background: "var(--dnd-surface)" }}>
                  <span className="text-xs" style={{ color: "var(--dnd-muted)" }}>
                    {label}
                  </span>
                  <select value={scores[key]} onChange={(event) => updateScore(key, Number(event.target.value))} className="mt-2 w-full rounded border bg-transparent px-2 py-1" style={{ borderColor: "var(--dnd-accent-soft)", color: "var(--dnd-ink)" }}>
                    {[8, 9, 10, 11, 12, 13, 14, 15].map((value) => (
                      <option key={value}>{value}</option>
                    ))}
                  </select>
                  <strong className="mt-2 block text-lg">
                    {calculateModifier(scores[key]) >= 0 ? "+" : ""}
                    {calculateModifier(scores[key])}
                  </strong>
                </label>
              ))}
            </div>
            <p className="mt-3 text-xs" style={{ color: "var(--dnd-muted)" }}>
              Array standard disponible: {STANDARD_ARRAY.join(" / ")} · PV de départ estimés: {hp}
            </p>
          </div>
        )}
        {step === 5 && (
          <div className="grid gap-3 sm:grid-cols-2">
            <p className="text-sm sm:col-span-2" style={{ color: "var(--dnd-muted)" }}>
              Choisissez les maîtrises de classe après celles accordées par l&apos;historique.
            </p>
            <p className="text-sm sm:col-span-2" style={{ color: "var(--dnd-muted)" }}>
              Sélection: {selectedSkills.length}/{skillQuota}. Les compétences déjà accordées par l&apos;historique sont incluses.
            </p>
            {availableSkills.map((skill) => (
              <label key={skill.code} className="flex items-center gap-3 rounded-lg p-3 text-sm" style={{ background: "var(--dnd-surface)" }}>
                <input type="checkbox" checked={selectedSkills.includes(skill.code)} disabled={!selectedSkills.includes(skill.code) && selectedSkills.length >= skillQuota} onChange={() => setSelectedSkills((current) => (current.includes(skill.code) ? current.filter((item) => item !== skill.code) : [...current, skill.code]))} />
                <CompendiumTooltip item={{ name: skill.name, type: "Compétence", description: `${skill.description} ${skill.examples}` }}>{skill.name}</CompendiumTooltip>
              </label>
            ))}
            {martialClass && (
              <fieldset className="sm:col-span-2 rounded-lg border p-4" style={{ borderColor: "var(--dnd-accent-soft)", background: "var(--dnd-surface)" }}>
                <legend className="px-2 text-sm font-semibold">
                  Maîtrises d&apos;armes · {selectedWeaponMasteryIds.length}/{weaponMasteryQuota}
                </legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {availableWeapons.map((weapon) => (
                    <label key={weapon.id} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={Boolean(weapon.masteryPropertyId && selectedWeaponMasteryIds.includes(weapon.masteryPropertyId))} disabled={!weapon.masteryPropertyId || (!selectedWeaponMasteryIds.includes(weapon.masteryPropertyId ?? "") && selectedWeaponMasteryIds.length >= weaponMasteryQuota)} onChange={() => weapon.masteryPropertyId && setSelectedWeaponMasteryIds((current) => (current.includes(weapon.masteryPropertyId ?? "") ? current.filter((id) => id !== weapon.masteryPropertyId) : [...current, weapon.masteryPropertyId].filter((id): id is string => Boolean(id))))} />
                      {weapon.name}{" "}
                      <span className="text-xs" style={{ color: "var(--dnd-muted)" }}>
                        {compendium.weaponMasteries.find((mastery) => mastery.id === weapon.masteryPropertyId)?.name ?? "Maîtrise"}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            )}
            <fieldset className="sm:col-span-2 rounded-lg border p-4" style={{ borderColor: "var(--dnd-accent-soft)", background: "var(--dnd-surface)" }}>
              <legend className="px-2 text-sm font-semibold">Équipement de départ</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {compendium.equipment
                  .filter((item) => item.type === "ARMOR" || item.type === "SHIELD")
                  .map((item) => (
                    <label key={item.id} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={startingEquipmentIds.includes(item.id)} onChange={() => setStartingEquipmentIds((current) => (current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current, item.id]))} />
                      {item.name}{" "}
                      {item.armorClass ? (
                        <span className="text-xs" style={{ color: "var(--dnd-muted)" }}>
                          CA {item.armorClass}
                        </span>
                      ) : null}
                    </label>
                  ))}
              </div>
            </fieldset>
          </div>
        )}
        {step === 5 && spellSelectionRequired && (
          <div className="mt-5 grid gap-5">
            <div className="rounded-lg border p-4" style={{ borderColor: "var(--dnd-accent-soft)", background: "var(--dnd-surface)" }}>
              <p className="text-sm font-semibold">
                Tours de Magie (Niveau 0 / Cantrips) · {selectedCantripCount}/{spellQuota.cantrips}
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {availableCantrips.map((spell) => {
                  const checked = selectedSpellIds.includes(spell.id);
                  return (
                    <label key={spell.id} className="grid gap-2 rounded-md border p-3 text-sm" style={{ borderColor: "var(--dnd-accent-soft)" }}>
                      <span className="flex items-center gap-2 font-semibold">
                        <input type="checkbox" checked={checked} onChange={() => setSelectedSpellIds((current) => (current.includes(spell.id) ? current.filter((id) => id !== spell.id) : [...current, spell.id]))} disabled={!checked && selectedCantripCount >= spellQuota.cantrips} />
                        {spell.name}
                      </span>
                      <span className="text-xs" style={{ color: "var(--dnd-muted)" }}>
                        École {spell.school} · Portée {spell.range} · Temps d&apos;incantation {spell.castingTime} · Composantes {componentsLabel(spell.components)} · {spell.concentration ? "Concentration" : "Sans concentration"}
                      </span>
                      <span className="text-xs leading-5">{spell.description}</span>
                    </label>
                  );
                })}
              </div>
            </div>
            <div className="rounded-lg border p-4" style={{ borderColor: "var(--dnd-accent-soft)", background: "var(--dnd-surface)" }}>
              <p className="text-sm font-semibold">
                Sorts de Niveau 1 · {selectedLevelOneCount}/{spellQuota.levelOne}
                {spellQuota.prepared ? " préparés" : " connus"}
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {availableLevelOneSpells.map((spell) => {
                  const checked = selectedSpellIds.includes(spell.id);
                  return (
                    <label key={spell.id} className="grid gap-2 rounded-md border p-3 text-sm" style={{ borderColor: "var(--dnd-accent-soft)" }}>
                      <span className="flex items-center gap-2 font-semibold">
                        <input type="checkbox" checked={checked} onChange={() => setSelectedSpellIds((current) => (current.includes(spell.id) ? current.filter((id) => id !== spell.id) : [...current, spell.id]))} disabled={!checked && selectedLevelOneCount >= spellQuota.levelOne} />
                        {spell.name}
                      </span>
                      <span className="text-xs" style={{ color: "var(--dnd-muted)" }}>
                        École {spell.school} · Portée {spell.range} · Temps d&apos;incantation {spell.castingTime} · Composantes {componentsLabel(spell.components)} · {spell.concentration ? "Concentration" : "Sans concentration"}
                      </span>
                      <span className="text-xs leading-5">{spell.description}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        {step === 6 && (
          <div className="rounded-lg p-5" style={{ background: "var(--dnd-surface)" }}>
            <p className="text-sm uppercase tracking-wider" style={{ color: "var(--dnd-accent)" }}>
              Prêt à jouer
            </p>
            <h3 className="mt-2 text-2xl font-semibold">{name || "Personnage sans nom"}</h3>
            <p className="mt-2" style={{ color: "var(--dnd-muted)" }}>
              {species} · {background} · {characterClass} · Niveau 1
            </p>

            <div className="mt-5 grid gap-2 sm:grid-cols-3 md:grid-cols-6">
              {abilities.map(({ key, label }) => (
                <div key={key} className="rounded-md border p-2 text-center" style={{ borderColor: "var(--dnd-accent-soft)" }}>
                  <span className="block text-xs" style={{ color: "var(--dnd-muted)" }}>
                    {label}
                  </span>
                  <strong className="block text-lg">{scores[key]}</strong>
                  <span className="text-xs" style={{ color: "var(--dnd-muted)" }}>
                    {calculateModifier(scores[key]) >= 0 ? "+" : ""}
                    {calculateModifier(scores[key])}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3 text-center">
              <div>
                <strong className="block text-xl">{hp}</strong>
                <span className="text-xs" style={{ color: "var(--dnd-muted)" }}>
                  PV
                </span>
              </div>
              <div>
                <strong className="block text-xl">{startingArmorClass}</strong>
                <span className="text-xs" style={{ color: "var(--dnd-muted)" }}>
                  CA finale
                </span>
              </div>
              <div>
                <strong className="block text-xl">{pointBuyCost(scores)}</strong>
                <span className="text-xs" style={{ color: "var(--dnd-muted)" }}>
                  points
                </span>
              </div>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div className="rounded-lg border p-3" style={{ borderColor: "var(--dnd-accent-soft)" }}>
                <p className="text-sm font-semibold">Compétences maîtrisées</p>
                <p className="mt-2 text-sm">{selectedSkills.length ? selectedSkills.map((code) => compendium.skills.find((skill) => skill.code === code)?.name ?? code).join(", ") : "Aucune"}</p>
              </div>
              <div className="rounded-lg border p-3" style={{ borderColor: "var(--dnd-accent-soft)" }}>
                <p className="text-sm font-semibold">Maîtrises d&apos;armes (2024)</p>
                <p className="mt-2 text-sm">{selectedWeaponMasteries.length ? selectedWeaponMasteries.map((mastery) => mastery.name).join(", ") : "Aucune"}</p>
              </div>
              <div className="rounded-lg border p-3 sm:col-span-2" style={{ borderColor: "var(--dnd-accent-soft)" }}>
                <p className="text-sm font-semibold">Don d&apos;origine</p>
                {selectedBackground?.originFeat ? (
                  <>
                    <p className="mt-2 text-sm font-medium">{selectedBackground.originFeat.name}</p>
                    <p className="mt-1 text-xs leading-5" style={{ color: "var(--dnd-muted)" }}>
                      {selectedBackground.originFeat.description}
                    </p>
                  </>
                ) : (
                  <p className="mt-2 text-sm">Aucun</p>
                )}
              </div>
              <div className="rounded-lg border p-3 sm:col-span-2" style={{ borderColor: "var(--dnd-accent-soft)" }}>
                <p className="text-sm font-semibold">Aptitudes de classe (niveau 1)</p>
                {classLevelOneFeatures.length ? (
                  <ul className="mt-2 grid gap-2 text-sm">
                    {classLevelOneFeatures.map((feature) => (
                      <li key={feature.id}>
                        <span className="font-medium">{feature.name}</span> —{" "}
                        <span className="text-xs leading-5" style={{ color: "var(--dnd-muted)" }}>
                          {feature.description}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm">Aucune aptitude référencée.</p>
                )}
              </div>
              {spellSelectionRequired && (
                <>
                  <div className="rounded-lg border p-3" style={{ borderColor: "var(--dnd-accent-soft)" }}>
                    <p className="text-sm font-semibold">
                      Tours de magie choisis · {selectedCantripCount}/{spellQuota.cantrips}
                    </p>
                    <ul className="mt-2 grid gap-1 text-sm">{selectedCantrips.length ? selectedCantrips.map((spell) => <li key={spell.id}>{spell.name}</li>) : <li>Aucun</li>}</ul>
                  </div>
                  <div className="rounded-lg border p-3" style={{ borderColor: "var(--dnd-accent-soft)" }}>
                    <p className="text-sm font-semibold">
                      Sorts de niveau 1 · {selectedLevelOneCount}/{spellQuota.levelOne}
                    </p>
                    <ul className="mt-2 grid gap-1 text-sm">{selectedLevelOneSpells.length ? selectedLevelOneSpells.map((spell) => <li key={spell.id}>{spell.name}</li>) : <li>Aucun</li>}</ul>
                  </div>
                </>
              )}
              <div className="rounded-lg border p-3" style={{ borderColor: "var(--dnd-accent-soft)" }}>
                <p className="text-sm font-semibold">Bourse de départ</p>
                <p className="mt-2 text-sm">
                  {startingCopperPieces} PC · {startingSilverPieces} PA · {startingElectrumPieces} PE · {startingGoldPieces} PO · {startingPlatinumPieces} PP
                </p>
              </div>
              <div className="rounded-lg border p-3" style={{ borderColor: "var(--dnd-accent-soft)" }}>
                <p className="text-sm font-semibold">Inventaire de départ</p>
                <p className="mt-2 text-sm">{selectedEquipmentItems.length ? selectedEquipmentItems.map((item) => item.name).join(", ") : "Aucun équipement sélectionné"}</p>
              </div>
              <div className="rounded-lg border p-3 sm:col-span-2" style={{ borderColor: "var(--dnd-accent-soft)" }}>
                <p className="text-sm font-semibold">Langues connues</p>
                <p className="mt-2 text-sm">
                  {selectedLanguageIds.length
                    ? compendium.languages
                        .filter((language) => selectedLanguageIds.includes(language.id))
                        .map((language) => language.name)
                        .join(", ")
                    : "Aucune"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="mt-6 flex justify-between">
        <button type="button" disabled={step === 1} onClick={() => setStep((current) => current - 1)} className="rounded-md border px-4 py-2 text-sm disabled:opacity-40" style={{ borderColor: "var(--dnd-accent-soft)" }}>
          Précédent
        </button>
        <button type="button" onClick={nextStep} disabled={pending || (step === 4 && !isValidPointBuy(scores)) || (step === 5 && (selectedSkills.length !== skillQuota || !spellQuotasMet || (martialClass && selectedWeaponMasteryIds.length !== weaponMasteryQuota)))} className="rounded-md px-4 py-2 text-sm font-semibold text-white disabled:opacity-40" style={{ background: "var(--dnd-accent)" }}>
          {pending ? "Création..." : step === 6 ? "Valider le personnage" : step === 5 ? "Voir le résumé" : "Continuer"}
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {error}
        </p>
      )}
    </section>
  );
}
