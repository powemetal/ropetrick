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
  classFeaturesAtLevel: { id: string; name: string }[];
  onNavigateToFeatsTab: () => void;
};

export function CharacterSkills({ character, editing, proficiencies, cycleSkill, skillBonuses, activeFeats, classFeaturesAtLevel, onNavigateToFeatsTab }: CharacterSkillsProps) {
  const skillDefinitions = new Map((character.skillDefinitions ?? []).map((definition) => [definition.code.toLowerCase(), definition]));

  return (
    <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_0.75fr]">
      <section className="rounded-lg border p-4" style={{ borderColor: "var(--dnd-accent-soft)", background: "var(--dnd-surface)" }}>
        <h3 className="font-semibold">Compétences · verrouillées</h3>
        <div className="mt-3 grid gap-1 sm:grid-cols-2">
          {SKILLS.map((skill) => {
            const state = proficiencies[skill] ?? "NONE";
            return (
              <button key={skill} type="button" disabled={!editing} onClick={() => cycleSkill(skill)} className="flex items-center justify-between rounded px-2 py-1.5 text-left text-sm disabled:cursor-not-allowed">
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
            Voir tout
          </button>
        </div>

        <div className="mt-3 flex flex-1 flex-col gap-2">
          {[...classFeaturesAtLevel, ...activeFeats].slice(0, 6).map((feat, i) => (
            <div key={feat.id + i} className="flex items-center justify-between rounded bg-white/40 px-2 py-1.5 text-xs border border-[var(--dnd-accent-soft)]">
              <span className="font-medium truncate mr-2">{feat.name}</span>
              <span className="shrink-0 rounded-full bg-[var(--dnd-accent-soft)] px-2 py-0.5 text-[9px] uppercase tracking-wider font-bold" style={{ color: "var(--dnd-accent)" }}>
                {"level" in feat ? (i === 0 ? "Classe" : "Aptitude") : "Don"}
              </span>
            </div>
          ))}
          {[...classFeaturesAtLevel, ...activeFeats].length === 0 && <p className="text-xs italic text-center mt-4" style={{ color: "var(--dnd-muted)" }}>Aucune aptitude enregistrée</p>}
        </div>
      </section>
    </div>
  );
}