"use client";

import { useMemo } from "react";
import { CompendiumTooltip } from "@/components/ui/CompendiumTooltip";
import {
  SKILL_ABILITIES,
  SKILLS,
  calculateModifier,
  proficiencyBonus,
  type Ability,
  type AbilityScores,
  type Skill,
  type SkillProficiency,
} from "@/modules/characters/engine/dnd-rules-engine";
import {
  abilityLabels,
  skillCodeFor,
  skillLabels,
  type CharacterSheetViewCharacter,
  type CharacterFeatEntry,
} from "@/modules/characters/components/sheet/shared";

type CharacterSkillsProps = {
  character: Pick<CharacterSheetViewCharacter, "skillDefinitions" | "level" | "dndClass"> & {
    abilityScores?: Partial<AbilityScores>;
    savingThrows?: unknown;
  };
  editing: boolean;
  proficiencies: Partial<Record<Skill, SkillProficiency>>;
  cycleSkill: (skill: Skill) => void;
  skillBonuses: Record<Skill, number>;
  activeFeats: CharacterFeatEntry[];
  classFeaturesAtLevel: { id?: string; name: string; level?: number; isPinned?: boolean }[];
  onNavigateToFeatsTab: () => void;
  onTogglePin?: (uniqueKey: string) => void;
};

export function CharacterSkills({
  character,
  editing,
  proficiencies,
  cycleSkill,
  skillBonuses,
  activeFeats,
  classFeaturesAtLevel,
  onNavigateToFeatsTab,
  onTogglePin,
}: CharacterSkillsProps) {
  const pb = proficiencyBonus(character.level ?? 1);

  const skillDefinitions = useMemo(
    () =>
      new Map(
        (character.skillDefinitions ?? []).map((definition) => [
          definition.code.toLowerCase(),
          definition,
        ])
      ),
    [character.skillDefinitions]
  );

  // Mémorisation et harmonisation des éléments épinglés
  const displayItems = useMemo(() => {
    const classItems = (classFeaturesAtLevel ?? []).map((f, idx) => ({
      ...f,
      type: "class" as const,
      uniqueId: `class-trait-${f.id ?? idx}-${idx}`,
    }));

    const featItems = (activeFeats ?? []).map((f: any, idx: number) => {
      const typePrefix =
        f.featureType === "race" ? "racial" : f.featureType === "class" ? "class-trait" : "acquired";
      return {
        ...f,
        type: f.featureType === "class" ? ("class" as const) : ("feat" as const),
        uniqueId: `${typePrefix}-${f.id ?? idx}-${idx}`,
      };
    });

    return [...classItems, ...featItems].filter((item) => Boolean(item.isPinned));
  }, [classFeaturesAtLevel, activeFeats]);

  // Calcul des sauvegardes maîtrisées
  const savingThrowBonuses = useMemo(() => {
    const abilities: Ability[] = ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"];
    const scores = character.abilityScores ?? {};
    const classSaves: unknown = character.dndClass && "savingThrows" in character.dndClass ? (character.dndClass as any).savingThrows : [];
    const customSaves = (character.savingThrows as Record<string, unknown>) ?? {};

    return abilities.reduce((acc, ability) => {
      const shortKey = ability.slice(0, 3);
      const mod = calculateModifier(scores[ability] ?? 10);

      // Détection de maîtrise (soit par la classe, soit par le JSON character.savingThrows)
      const isProficient = Boolean(
        (Array.isArray(classSaves) && classSaves.some((s) => String(s).toLowerCase() === ability || String(s).toLowerCase() === shortKey)) ||
        customSaves[ability] === 1 ||
        customSaves[shortKey] === 1 ||
        customSaves[ability] === true ||
        customSaves[shortKey] === true
      );

      acc[ability] = {
        mod,
        total: mod + (isProficient ? pb : 0),
        isProficient,
      };
      return acc;
    }, {} as Record<Ability, { mod: number; total: number; isProficient: boolean }>);
  }, [character.abilityScores, character.dndClass, character.savingThrows, pb]);

  return (
    <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_0.75fr]">
      {/* 1. Colonne de Gauche : Jets de Sauvegarde & Compétences */}
      <section
        className="rounded-lg border p-4"
        style={{ borderColor: "var(--dnd-accent-soft)", background: "var(--dnd-surface)" }}
      >
        {/* Section Jets de Sauvegarde */}
        <div className="mb-5 pb-4 border-b" style={{ borderColor: "var(--dnd-accent-soft)" }}>
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="font-semibold text-xs uppercase tracking-wider text-[var(--dnd-ink)]">
              Jets de Sauvegarde
            </h3>
            <span className="text-[10px] text-[var(--dnd-muted)] font-mono">
              Maîtrise : +{pb}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {(Object.keys(abilityLabels) as Ability[]).map((ability) => {
              const save = savingThrowBonuses[ability];

              return (
                <div
                  key={`save-${ability}`}
                  className="flex flex-col items-center justify-center rounded-lg border p-1.5 transition-colors"
                  style={{
                    borderColor: save?.isProficient ? "var(--dnd-accent)" : "var(--dnd-accent-soft)",
                    backgroundColor: save?.isProficient
                      ? "color-mix(in srgb, var(--dnd-accent) 12%, transparent)"
                      : "transparent",
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span
                      className="size-1.5 rounded-full shrink-0"
                      style={{
                        background: save?.isProficient ? "var(--dnd-accent)" : "transparent",
                        border: "1px solid var(--dnd-accent)",
                      }}
                    />
                    <span className="text-[10px] font-bold text-[var(--dnd-ink)]">
                      {abilityLabels[ability]}
                    </span>
                  </div>
                  <strong className="text-sm font-mono mt-0.5">
                    {(save?.total ?? 0) >= 0 ? `+${save?.total ?? 0}` : save?.total ?? 0}
                  </strong>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section Compétences */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-[var(--dnd-ink)]">
            Compétences {editing ? "· mode édition" : ""}
          </h3>
          {editing && (
            <span className="text-[10px] text-[var(--dnd-muted)]">
              Clic : Normal → Maîtrise → Expertise
            </span>
          )}
        </div>

        <div className="mt-3 grid gap-1 sm:grid-cols-2">
          {SKILLS.map((skill) => {
            const state = proficiencies[skill] ?? "NONE";
            const bonus = skillBonuses[skill] ?? 0;

            return (
              <button
                key={`skill-${skill}`}
                type="button"
                disabled={!editing}
                onClick={() => cycleSkill(skill)}
                className={`flex items-center justify-between rounded px-2 py-1.5 text-left text-sm transition-colors ${
                  editing
                    ? "hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                    : "cursor-default"
                }`}
              >
                <span className="flex items-center gap-2 truncate">
                  <span
                    className="inline-flex size-2.5 shrink-0 items-center justify-center rounded-full transition-all"
                    style={{
                      border: "1.5px solid var(--dnd-accent)",
                      background:
                        state === "EXPERTISE"
                          ? "var(--dnd-accent)"
                          : state === "PROFICIENT"
                          ? "var(--dnd-accent)"
                          : "transparent",
                      boxShadow:
                        state === "EXPERTISE"
                          ? "0 0 0 1.5px var(--dnd-surface), 0 0 0 3px var(--dnd-accent)"
                          : undefined,
                    }}
                    title={`Statut : ${state === "EXPERTISE" ? "Expertise" : state === "PROFICIENT" ? "Maîtrise" : "Non maîtrisé"}`}
                  />

                  <CompendiumTooltip
                    item={{
                      name: skillLabels[skill],
                      type: "Compétence",
                      description: `${
                        skillDefinitions.get(skillCodeFor(skill).toLowerCase())?.description ??
                        "Description indisponible."
                      } ${skillDefinitions.get(skillCodeFor(skill).toLowerCase())?.examples ?? ""}`,
                    }}
                  >
                    <span className="font-medium">{skillLabels[skill]}</span>
                  </CompendiumTooltip>

                  <span className="text-xs" style={{ color: "var(--dnd-muted)" }}>
                    ({abilityLabels[SKILL_ABILITIES[skill]]})
                  </span>
                </span>

                <strong className="ml-2 font-mono text-sm">
                  {bonus >= 0 ? `+${bonus}` : bonus}
                </strong>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Colonne de Droite : Dons & Aptitudes Clés */}
      <section
        className="flex flex-col rounded-lg border p-4"
        style={{ borderColor: "var(--dnd-accent-soft)", background: "var(--dnd-surface)" }}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-[var(--dnd-ink)]">Dons & Aptitudes clés</h3>
          <button
            type="button"
            onClick={onNavigateToFeatsTab}
            className="text-[11px] font-medium underline hover:opacity-80"
            style={{ color: "var(--dnd-accent)" }}
          >
            {editing ? "Gérer / Voir tout" : "Voir tout"}
          </button>
        </div>

        <div className="mt-3 flex flex-1 flex-col gap-2">
          {displayItems.map((feat) => {
            const isClassFeature = feat.type === "class";

            return (
              <div
                key={`pinned-feat-${feat.uniqueId}`}
                className="flex items-center justify-between rounded px-2.5 py-1.5 text-xs border"
                style={{
                  borderColor: "var(--dnd-accent-soft)",
                  backgroundColor: "color-mix(in srgb, var(--dnd-surface) 90%, var(--dnd-accent) 10%)",
                }}
              >
                <span className="font-medium truncate mr-2 text-[var(--dnd-ink)]">{feat.name}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className="rounded-full px-2 py-0.5 text-[9px] uppercase tracking-wider font-bold"
                    style={{
                      backgroundColor: "var(--dnd-accent-soft)",
                      color: "var(--dnd-accent)",
                    }}
                  >
                    {isClassFeature ? "Aptitude" : "Don"}
                  </span>
                  {editing && onTogglePin && (
                    <button
                      type="button"
                      onClick={() => onTogglePin(feat.uniqueId)}
                      className="text-red-500 hover:text-red-700 font-bold px-1 transition-colors"
                      title="Détacher des favoris"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {displayItems.length === 0 && (
            <p className="text-xs italic text-center my-auto py-4" style={{ color: "var(--dnd-muted)" }}>
              {editing
                ? "Aucun élément épinglé. Clique sur 'Gérer / Voir tout' puis sur '☆ Épingler' !"
                : "Aucun don ou aptitude clé épinglé"}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}