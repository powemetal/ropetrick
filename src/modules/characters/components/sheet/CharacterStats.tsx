"use client";

import { calculateModifier, type Ability, type AbilityScores } from "@/modules/characters/engine/dnd-rules-engine";
import { abilityLabels, type CharacterSheetViewCharacter } from "@/modules/characters/components/sheet/shared";

type CharacterStatsProps = {
  character: Pick<CharacterSheetViewCharacter, "armorClass" | "initiative" | "speed" | "hitDie" | "level">;
  editing: boolean;
  displayedScores: AbilityScores;
  draftScores: AbilityScores;
  setDraftScores: (value: AbilityScores | ((current: AbilityScores) => AbilityScores)) => void;
  hitPoints: number;
  setHitPoints: (value: number | ((current: number) => number)) => void;
  maxHitPoints: number;
  temporaryHitPoints: number;
  setTemporaryHitPoints: (value: number | ((current: number) => number)) => void;
  hitDice: number;
  setHitDice: (value: number | ((current: number) => number)) => void;
  inspiration: boolean;
  setInspiration: (value: boolean | ((current: boolean) => boolean)) => void;
};

function Tracker({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border p-3 text-center" style={{ borderColor: "var(--dnd-accent-soft)", background: "var(--dnd-surface)" }}>
      <p className="text-xs" style={{ color: "var(--dnd-muted)" }}>
        {label}
      </p>
      <p className="mt-2 text-xl font-bold">{value}</p>
    </div>
  );
}

export function CharacterStats({ character, editing, displayedScores, draftScores, setDraftScores, hitPoints, setHitPoints, maxHitPoints, temporaryHitPoints, setTemporaryHitPoints, hitDice, setHitDice, inspiration, setInspiration }: CharacterStatsProps) {
  return (
    <>
      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1.35fr]">
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-3">
          {(Object.keys(abilityLabels) as Ability[]).map((ability) => (
            <div key={ability} className="rounded-lg border p-3 text-center" style={{ borderColor: "var(--dnd-accent-soft)", background: "var(--dnd-surface)" }}>
              <p className="text-xs font-semibold" style={{ color: "var(--dnd-accent)" }}>
                {abilityLabels[ability]}
              </p>
              {editing ? (
                <input type="number" min="1" max="30" value={draftScores[ability]} onChange={(event) => setDraftScores((current) => ({ ...current, [ability]: Number(event.target.value) }))} className="mt-2 w-full rounded border bg-transparent px-1 py-1 text-center text-xl font-bold" />
              ) : (
                <p className="mt-2 text-2xl font-bold">
                  {calculateModifier(displayedScores[ability]) >= 0 ? "+" : ""}
                  {calculateModifier(displayedScores[ability])}
                </p>
              )}
              <p className="mt-1 text-xs" style={{ color: "var(--dnd-muted)" }}>
                {displayedScores[ability]}
              </p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Tracker label="CA" value={character.armorClass ?? 10} />
          <Tracker label="Initiative" value={`${(character.initiative ?? calculateModifier(displayedScores.dexterity)) >= 0 ? "+" : ""}${character.initiative ?? calculateModifier(displayedScores.dexterity)}`} />
          <Tracker label="Vitesse" value={`${character.speed ?? 30} ft`} />
          <Tracker label="Dés de vie" value={`d${character.hitDie ?? 8}`} />
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-lg border p-4" style={{ borderColor: "var(--dnd-accent-soft)", background: "var(--dnd-surface)" }}>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Points de vie</h3>
            <span className="text-sm" style={{ color: "var(--dnd-muted)" }}>
              {hitPoints} / {maxHitPoints}
            </span>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-black/20">
            <div className="h-full rounded-full transition-all" style={{ width: `${Math.min((hitPoints / Math.max(maxHitPoints, 1)) * 100, 100)}%`, background: "var(--dnd-accent)" }} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => setHitPoints((current) => Math.min(current + 1, maxHitPoints))} className="rounded border px-3 py-1 text-sm">
              + 1 PV
            </button>
            <button type="button" onClick={() => setHitPoints((current) => Math.max(current - 1, 0))} className="rounded border px-3 py-1 text-sm">
              - 1 PV
            </button>
            <label className="ml-auto flex items-center gap-2 text-sm">
              Temporaires
              <input type="number" min="0" value={temporaryHitPoints} onChange={(event) => setTemporaryHitPoints(Number(event.target.value))} className="w-16 rounded border bg-transparent px-2 py-1" />
            </label>
          </div>
        </section>
        <section className="rounded-lg border p-4" style={{ borderColor: "var(--dnd-accent-soft)", background: "var(--dnd-surface)" }}>
          <h3 className="font-semibold">Ressources de jeu</h3>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span>
              Dés de vie: {hitDice} / {character.level}
            </span>
            <button type="button" onClick={() => setHitDice((current) => Math.max(current - 1, 0))} className="rounded border px-2 py-1">
              Dépenser
            </button>
          </div>
          <button type="button" onClick={() => setInspiration((current) => !current)} className="mt-4 flex w-full items-center justify-between rounded border px-3 py-2 text-sm">
            <span>Inspiration</span>
            <span className="size-4 rounded-full" style={{ background: inspiration ? "var(--dnd-accent)" : "transparent", border: "2px solid var(--dnd-accent)" }} />
          </button>
        </section>
      </div>
    </>
  );
}
