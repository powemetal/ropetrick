"use client";

import { useState } from "react";
import { calculateModifier, type Ability, type AbilityScores } from "@/modules/characters/engine/dnd-rules-engine";
import { abilityLabels, type CharacterSheetViewCharacter } from "@/modules/characters/components/sheet/shared";
import { DeathSavesModule } from "./DeathSavesModule";

type CharacterStatsProps = {
  character: Pick<CharacterSheetViewCharacter, "armorClass" | "initiative" | "speed" | "hitDie" | "level">;
  editing: boolean;
  displayedScores: AbilityScores;
  draftScores: AbilityScores;
  setDraftScores: (value: AbilityScores | ((current: AbilityScores) => AbilityScores)) => void;
  hitPoints: number;
  setHitPoints: (value: number | ((current: number) => number)) => void;
  maxHitPoints: number;
  setDraftMaxHitPoints?: (value: number) => void;
  temporaryHitPoints: number;
  setTemporaryHitPoints: (value: number | ((current: number) => number)) => void;
  hitDice: number;
  setHitDice: (value: number | ((current: number) => number)) => void;
  inspiration: boolean;
  setInspiration: (value: boolean | ((current: boolean) => boolean)) => void;
  deathSaves: {
    successes: number;
    failures: number;
  };
  onUpdateDeathSaves: (successes: number, failures: number) => void;
};

export function CharacterStats({
  character,
  editing,
  displayedScores,
  draftScores,
  setDraftScores,
  hitPoints,
  setHitPoints,
  maxHitPoints,
  setDraftMaxHitPoints,
  temporaryHitPoints,
  setTemporaryHitPoints,
  hitDice,
  setHitDice,
  inspiration,
  setInspiration,
  deathSaves,
  onUpdateDeathSaves,
}: CharacterStatsProps) {
  const inputBorder = { borderColor: "var(--dnd-accent-soft)", backgroundColor: "var(--dnd-surface)" };

  const [isEditingHp, setIsEditingHp] = useState(false);
  const [hpInputValue, setHpInputValue] = useState(String(hitPoints));

  const handleHpSubmit = () => {
    const parsed = parseInt(hpInputValue, 10);
    if (!isNaN(parsed)) {
      setHitPoints(Math.max(0, Math.min(parsed, maxHitPoints)));
    }
    setIsEditingHp(false);
  };

  const handleTakeDamage = (amount: number = 1) => {
    if (temporaryHitPoints > 0) {
      const remainingTemp = Math.max(0, temporaryHitPoints - amount);
      const overflow = amount - (temporaryHitPoints - remainingTemp);
      setTemporaryHitPoints(remainingTemp);
      if (overflow > 0) {
        setHitPoints((curr) => Math.max(0, curr - overflow));
      }
    } else {
      setHitPoints((curr) => Math.max(0, curr - amount));
    }
  };

  const handleHeal = (amount: number = 1) => {
    setHitPoints((curr) => Math.min(maxHitPoints, curr + amount));
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

        {/* Trackers de Combat (Editables en mode édition) */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="rounded-lg border p-3 text-center" style={{ borderColor: "var(--dnd-accent-soft)", background: "var(--dnd-surface)" }}>
            <p className="text-xs" style={{ color: "var(--dnd-muted)" }}>CA</p>
            {editing ? (
              <input type="number" defaultValue={character.armorClass ?? 10} className="mt-2 w-full rounded border px-1 text-center text-lg font-bold outline-none" style={inputBorder} />
            ) : (
              <p className="mt-2 text-xl font-bold">{character.armorClass ?? 10}</p>
            )}
          </div>

          <div className="rounded-lg border p-3 text-center" style={{ borderColor: "var(--dnd-accent-soft)", background: "var(--dnd-surface)" }}>
            <p className="text-xs" style={{ color: "var(--dnd-muted)" }}>Initiative</p>
            <p className="mt-2 text-xl font-bold">
              {`${(character.initiative ?? calculateModifier(displayedScores.dexterity)) >= 0 ? "+" : ""}${character.initiative ?? calculateModifier(displayedScores.dexterity)}`}
            </p>
          </div>

          <div className="rounded-lg border p-3 text-center" style={{ borderColor: "var(--dnd-accent-soft)", background: "var(--dnd-surface)" }}>
            <p className="text-xs" style={{ color: "var(--dnd-muted)" }}>Vitesse</p>
            {editing ? (
              <input type="number" defaultValue={character.speed ?? 30} className="mt-2 w-full rounded border px-1 text-center text-lg font-bold outline-none" style={inputBorder} />
            ) : (
              <p className="mt-2 text-xl font-bold">{character.speed ?? 30} ft</p>
            )}
          </div>

          <div className="rounded-lg border p-3 text-center" style={{ borderColor: "var(--dnd-accent-soft)", background: "var(--dnd-surface)" }}>
            <p className="text-xs" style={{ color: "var(--dnd-muted)" }}>Dés de vie</p>
            <p className="mt-2 text-xl font-bold">d{character.hitDie ?? 8}</p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Points de vie */}
        <div className="space-y-4">
          <section
            className="rounded-lg border p-4"
            style={{ borderColor: "var(--dnd-accent-soft)", background: "var(--dnd-surface)" }}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-[var(--dnd-ink)]">Points de vie</h3>
              
              <div className="flex items-center gap-2">
                {isEditingHp ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      autoFocus
                      value={hpInputValue}
                      onChange={(e) => setHpInputValue(e.target.value)}
                      onBlur={handleHpSubmit}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleHpSubmit();
                        if (e.key === "Escape") setIsEditingHp(false);
                      }}
                      className="w-16 rounded border px-1 text-center text-sm font-mono outline-none"
                      style={inputBorder}
                    />
                  </div>
                ) : (
                  <span 
                    onClick={() => {
                      setHpInputValue(String(hitPoints));
                      setIsEditingHp(true);
                    }}
                    className="text-sm font-mono cursor-pointer hover:underline decoration-dashed underline-offset-4"
                    title="Cliquez pour modifier directement vos PV"
                    style={{ color: "var(--dnd-muted)" }}
                  >
                    {hitPoints}
                    {temporaryHitPoints > 0 ? (
                      <span className="text-amber-500 font-bold"> (+{temporaryHitPoints})</span>
                    ) : null}
                  </span>
                )}

                <span className="text-sm font-mono" style={{ color: "var(--dnd-muted)" }}>/</span>

                {/* PV Max éditable en mode édition globale */}
                {editing && setDraftMaxHitPoints ? (
                  <input
                    type="number"
                    value={maxHitPoints}
                    onChange={(e) => setDraftMaxHitPoints(Number(e.target.value))}
                    className="w-16 rounded border px-1 text-center text-sm font-mono font-bold outline-none"
                    style={inputBorder}
                  />
                ) : (
                  <span className="text-sm font-mono font-bold" style={{ color: "var(--dnd-ink)" }}>
                    {maxHitPoints}
                  </span>
                )}
              </div>
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

            {/* Boutons d'action PV (+1, +10, -1, -10) */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleHeal(1)}
                className="rounded border px-2.5 py-1 text-xs font-semibold transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                style={{ borderColor: "var(--dnd-accent-soft)" }}
              >
                +1 PV
              </button>
              <button
                type="button"
                onClick={() => handleHeal(10)}
                className="rounded border px-2.5 py-1 text-xs font-semibold transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                style={{ borderColor: "var(--dnd-accent-soft)" }}
              >
                +10 PV
              </button>
              <button
                type="button"
                onClick={() => handleTakeDamage(1)}
                className="rounded border px-2.5 py-1 text-xs font-semibold transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                style={{ borderColor: "var(--dnd-accent-soft)" }}
              >
                -1 Dégât
              </button>
              <button
                type="button"
                onClick={() => handleTakeDamage(10)}
                className="rounded border px-2.5 py-1 text-xs font-semibold transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                style={{ borderColor: "var(--dnd-accent-soft)" }}
              >
                -10 Dégâts
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

          {/* Module Jets contre la mort (automatique si PV <= 0) */}
          <DeathSavesModule
            currentHitPoints={hitPoints}
            deathSaves={deathSaves}
            onUpdateDeathSaves={onUpdateDeathSaves}
          />
        </div>

        {/* Ressources */}
        <section
          className="rounded-lg border p-4"
          style={{ borderColor: "var(--dnd-accent-soft)", background: "var(--dnd-surface)" }}
        >
          <h3 className="font-semibold text-[var(--dnd-ink)]">Ressources de jeu</h3>

          {/* Dés de vie avec édition directe si editing est actif */}
          <div className="mt-3 flex items-center justify-between text-sm">
            <span>Dés de vie :</span>
            <div className="flex items-center gap-2">
              {editing ? (
                <input
                  type="number"
                  min="0"
                  max={character.level}
                  value={hitDice}
                  onChange={(e) => setHitDice(Math.max(0, Math.min(Number(e.target.value), character.level)))}
                  className="w-14 rounded border px-1 text-center text-sm font-bold outline-none"
                  style={inputBorder}
                />
              ) : (
                <strong>{hitDice}</strong>
              )}
              <span>/ {character.level}</span>
            </div>

            {!editing && (
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
            )}
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