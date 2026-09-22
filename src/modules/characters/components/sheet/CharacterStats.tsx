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
    <div
      className="rounded-lg border p-3 text-center"
      style={{ borderColor: "var(--dnd-accent-soft)", background: "var(--dnd-surface)" }}
    >
      <p className="text-xs" style={{ color: "var(--dnd-muted)" }}>
        {label}
      </p>
      <p className="mt-2 text-xl font-bold">{value}</p>
    </div>
  );
}

export function CharacterStats({
  character,
  editing,
  displayedScores,
  draftScores,
  setDraftScores,
  hitPoints,
  setHitPoints,
  maxHitPoints,
  temporaryHitPoints,
  setTemporaryHitPoints,
  hitDice,
  setHitDice,
  inspiration,
  setInspiration,
}: CharacterStatsProps) {
  const inputBorder = { borderColor: "var(--dnd-accent-soft)", backgroundColor: "var(--dnd-surface)" };

  // Dégâts subis : déduit d'abord les PV temporaires selon les règles 5e
  const handleTakeDamage = () => {
    if (temporaryHitPoints > 0) {
      setTemporaryHitPoints((curr) => Math.max(0, curr - 1));
    } else {
      setHitPoints((curr) => Math.max(0, curr - 1));
    }
  };

  const hpPercent = Math.min((hitPoints / Math.max(maxHitPoints, 1)) * 100, 100);
  const tempPercent = Math.min((temporaryHitPoints / Math.max(maxHitPoints, 1)) * 100, 100);

  return (
    <>
      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1.35fr]">
        {/* Caractéristiques */}
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-3">
          {(Object.keys(abilityLabels) as Ability[]).map((ability) => {
            const score = displayedScores[ability] ?? 10;
            const mod = calculateModifier(score);

            return (
              <div
                key={ability}
                className="rounded-lg border p-3 text-center"
                style={{ borderColor: "var(--dnd-accent-soft)", background: "var(--dnd-surface)" }}
              >
                <p className="text-xs font-semibold" style={{ color: "var(--dnd-accent)" }}>
                  {abilityLabels[ability]}
                </p>
                {editing ? (
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={draftScores[ability] ?? 10}
                    onChange={(event) =>
                      setDraftScores((current) => ({
                        ...current,
                        [ability]: Number(event.target.value),
                      }))
                    }
                    className="mt-2 w-full rounded border px-1 py-1 text-center text-xl font-bold outline-none"
                    style={inputBorder}
                  />
                ) : (
                  <p className="mt-2 text-2xl font-bold text-[var(--dnd-ink)]">
                    {mod >= 0 ? `+${mod}` : mod}
                  </p>
                )}
                <p className="mt-1 text-xs" style={{ color: "var(--dnd-muted)" }}>
                  {score}
                </p>
              </div>
            );
          })}
        </div>

        {/* Trackers de Combat */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Tracker label="CA" value={character.armorClass ?? 10} />
          <Tracker
            label="Initiative"
            value={`${(character.initiative ?? calculateModifier(displayedScores.dexterity)) >= 0 ? "+" : ""}${character.initiative ?? calculateModifier(displayedScores.dexterity)}`}
          />
          <Tracker label="Vitesse" value={`${character.speed ?? 30} ft`} />
          <Tracker label="Dés de vie" value={`d${character.hitDie ?? 8}`} />
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Points de vie */}
        <section
          className="rounded-lg border p-4"
          style={{ borderColor: "var(--dnd-accent-soft)", background: "var(--dnd-surface)" }}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-[var(--dnd-ink)]">Points de vie</h3>
            <span className="text-sm font-mono" style={{ color: "var(--dnd-muted)" }}>
              {hitPoints}
              {temporaryHitPoints > 0 ? (
                <span className="text-amber-500 font-bold"> (+{temporaryHitPoints})</span>
              ) : null}{" "}
              / {maxHitPoints}
            </span>
          </div>

          {/* Jauge combinée PV + PV Temp */}
          <div className="mt-3 flex h-3 w-full overflow-hidden rounded-full bg-black/20">
            <div
              className="h-full transition-all"
              style={{ width: `${hpPercent}%`, background: "var(--dnd-accent)" }}
            />
            {temporaryHitPoints > 0 && (
              <div
                className="h-full bg-amber-400 transition-all"
                style={{ width: `${tempPercent}%` }}
                title={`PV Temporaires : ${temporaryHitPoints}`}
              />
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setHitPoints((current) => Math.min(current + 1, maxHitPoints))}
              className="rounded border px-3 py-1 text-sm font-semibold transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              style={{ borderColor: "var(--dnd-accent-soft)" }}
            >
              + 1 PV
            </button>
            <button
              type="button"
              onClick={handleTakeDamage}
              className="rounded border px-3 py-1 text-sm font-semibold transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              style={{ borderColor: "var(--dnd-accent-soft)" }}
            >
              - 1 Dégât
            </button>
            <label className="ml-auto flex items-center gap-2 text-xs font-semibold text-[var(--dnd-ink)]">
              Temporaires
              <input
                type="number"
                min="0"
                value={temporaryHitPoints}
                onChange={(event) => setTemporaryHitPoints(Math.max(0, Number(event.target.value)))}
                className="w-16 rounded border px-2 py-1 text-center text-sm outline-none"
                style={inputBorder}
              />
            </label>
          </div>
        </section>

        {/* Ressources */}
        <section
          className="rounded-lg border p-4"
          style={{ borderColor: "var(--dnd-accent-soft)", background: "var(--dnd-surface)" }}
        >
          <h3 className="font-semibold text-[var(--dnd-ink)]">Ressources de jeu</h3>

          {/* Dés de vie avec dépense et récupération */}
          <div className="mt-3 flex items-center justify-between text-sm">
            <span>
              Dés de vie : <strong>{hitDice}</strong> / {character.level}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setHitDice((current) => Math.min(current + 1, character.level))}
                className="rounded border px-2 py-0.5 text-xs font-bold hover:bg-black/5 dark:hover:bg-white/5"
                style={{ borderColor: "var(--dnd-accent-soft)" }}
                title="Récupérer un dé de vie"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => setHitDice((current) => Math.max(current - 1, 0))}
                className="rounded border px-2.5 py-0.5 text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5"
                style={{ borderColor: "var(--dnd-accent-soft)" }}
              >
                Dépenser
              </button>
            </div>
          </div>

          {/* Inspiration */}
          <button
            type="button"
            onClick={() => setInspiration((current) => !current)}
            className="mt-4 flex w-full items-center justify-between rounded border px-3 py-2 text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5"
            style={{ borderColor: "var(--dnd-accent-soft)" }}
          >
            <span className="font-medium text-[var(--dnd-ink)]">Inspiration héroïque</span>
            <span
              className="size-4 rounded-full transition-all"
              style={{
                background: inspiration ? "var(--dnd-accent)" : "transparent",
                border: "2px solid var(--dnd-accent)",
                boxShadow: inspiration ? "0 0 6px var(--dnd-accent)" : "none",
              }}
            />
          </button>
        </section>
      </div>
    </>
  );
}