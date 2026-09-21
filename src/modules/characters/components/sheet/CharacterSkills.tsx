"use client";

import { CompendiumTooltip } from "@/components/ui/CompendiumTooltip";
import { SKILL_ABILITIES, SKILLS, type Skill, type SkillProficiency } from "@/modules/characters/engine/dnd-rules-engine";
import { abilityLabels, skillCodeFor, skillLabels, type CharacterSheetViewCharacter } from "@/modules/characters/components/sheet/shared";

import type { CharacterFeatEntry } from "@/modules/characters/components/sheet/shared";

type CharacterSkillsProps = {
  character: Pick<CharacterSheetViewCharacter, "skillDefinitions">;
  editing: boolean;
  proficiencies: Partial<Record<Skill, SkillProficiency>>;
  cycleSkill: (skill: Skill) => void;
  skillBonuses: Record<Skill, number>;
  activeFeats: CharacterFeatEntry[];
  classFeaturesAtLevel: { id?: string; name: string; level?: number; isPinned?: boolean }[];
  onNavigateToFeatsTab: () => void;
  onTogglePin?: (id: string) => void;
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
  onTogglePin
}: CharacterSkillsProps) {
  const skillDefinitions = new Map((character.skillDefinitions ?? []).map((definition) => [definition.code.toLowerCase(), definition]));

  // On combine toutes les sources en utilisant exactement la même structure d'index global
  const allAvailableItems = [
    ...classFeaturesAtLevel.map((f, globalIdx) => {
      const featId = f.id ?? globalIdx;
      return {
        ...f,
        type: 'class' as const,
        uniqueId: `class-trait-${featId}-${globalIdx}`
      };
    }),
    ...activeFeats.map((f: any, globalIdx: number) => {
      const featId = f.id ?? globalIdx;
      const typePrefix = f.featureType === "race" ? "racial" : f.featureType === "class" ? "class-trait" : "acquired";
      return {
        ...f,
        type: f.featureType === "class" ? ('class' as const) : ('feat' as const),
        uniqueId: `${typePrefix}-${featId}-${globalIdx}`
      };
    })
  ];

  // Uniquement les éléments explicitement épinglés (isPinned === true)
  const displayItems = allAvailableItems.filter((item: any) => item.isPinned === true);

  return (
    <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_0.75fr]">
      <section className="rounded-lg border p-4" style={{ borderColor: "var(--dnd-accent-soft)", background: "var(--dnd-surface)" }}>
        <h3 className="font-semibold">Compétences · verrouillées</h3>
        <div className="mt-3 grid gap-1 sm:grid-cols-2">
          {SKILLS.map((skill) => {
            const state = proficiencies[skill] ?? "NONE";
            return (
              <button key={`skill-${skill}`} type="button" disabled={Boolean(!editing)} onClick={() => cycleSkill(skill)} className="flex items-center justify-between rounded px-2 py-1.5 text-left text-sm disabled:cursor-not-allowed">
                <span>
                  <span className="mr-2 inline-block size-2 rounded-full" style={{ background: state === "NONE" ? "transparent" : "var(--dnd-accent)", border: "1px solid var(--dnd-accent)" }} />
                  <CompendiumTooltip item={{ name: skillLabels[skill], type: "Compétence", description: `${skillDefinitions.get(skillCodeFor(skill).toLowerCase())?.description ?? "Description indisponible."} ${skillDefinitions.get(skillCodeFor(skill).toLowerCase())?.examples ?? ""}` }}>{skillLabels[skill]}</CompendiumTooltip>{" "}
                  <span className="text-xs" style={{ color: "var(--dnd-muted)" }}>
                    ({abilityLabels[SKILL_ABILITIES[skill]]})
                  </span>
                </span>
                <strong>
                  {skillBonuses[skill] >= 0 ? "+" : ""}
                  {skillBonuses[skill]}
                </strong>
              </button>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col rounded-lg border p-4" style={{ borderColor: "var(--dnd-accent-soft)", background: "var(--dnd-surface)" }}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Dons & Aptitudes clés</h3>
          <button type="button" onClick={onNavigateToFeatsTab} className="text-[11px] font-medium hover:underline" style={{ color: "var(--dnd-accent)" }}>
            {editing ? "Gérer / Voir tout" : "Voir tout"}
          </button>
        </div>

        <div className="mt-3 flex flex-1 flex-col gap-2">
          {displayItems.map((feat) => {
            const isClassFeature = feat.type === 'class';

            return (
              <div key={`pinned-feat-${feat.uniqueId}`} className="flex items-center justify-between rounded bg-white/40 px-2 py-1.5 text-xs border border-[var(--dnd-accent-soft)]">
                <span className="font-medium truncate mr-2">{feat.name}</span>
                <div className="flex items-center gap-2">
                  <span className="shrink-0 rounded-full bg-[var(--dnd-accent-soft)] px-2 py-0.5 text-[9px] uppercase tracking-wider font-bold" style={{ color: "var(--dnd-accent)" }}>
                    {isClassFeature ? "Aptitude" : "Don"}
                  </span>
                  {editing && onTogglePin && (
                    <button 
                      type="button" 
                      onClick={() => onTogglePin(feat.uniqueId)}
                      className="text-red-500 hover:text-red-700 font-bold px-1"
                      title="Retirer des clés"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {displayItems.length === 0 && (
            <p className="text-xs italic text-center mt-4" style={{ color: "var(--dnd-muted)" }}>
              {editing ? "Aucun élément épinglé. Va dans 'Voir tout' pour en ajouter !" : "Aucun don ou aptitude clé épinglé"}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}