"use client";

import React from "react";

type DeathSavesProps = {
  currentHitPoints: number;
  deathSaves: {
    successes: number;
    failures: number;
  };
  onUpdateDeathSaves: (successes: number, failures: number) => void;
};

export function DeathSavesModule({
  currentHitPoints,
  deathSaves,
  onUpdateDeathSaves,
}: DeathSavesProps) {
  // Le module n'apparaît automatiquement que si les PV sont à 0 ou moins
  if (currentHitPoints > 0) {
    return null;
  }

  const handleToggle = (type: "successes" | "failures", index: number) => {
    const currentCount = deathSaves[type];
    // Si on clique sur la bulle déjà active, on décrémente, sinon on définit la valeur
    const newValue = currentCount === index + 1 ? index : index + 1;
    
    onUpdateDeathSaves(
      type === "successes" ? newValue : deathSaves.successes,
      type === "failures" ? newValue : deathSaves.failures
    );
  };

  return (
    <div 
      className="rounded-lg border p-4 shadow-sm animate-pulse"
      style={{ 
        borderColor: "var(--dnd-accent)", 
        backgroundColor: "var(--dnd-surface)" 
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
          ⚠️ Inconscient — Jets contre la mort
        </h3>
        <span className="text-xs text-[var(--dnd-muted)]">
          Stabilisé à 3 réussites / Mort à 3 échecs
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Succès */}
        <div className="flex items-center justify-between bg-black/5 dark:bg-white/5 p-2.5 rounded-md">
          <span className="text-xs font-semibold uppercase tracking-wider">Succès</span>
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => {
              const isChecked = i < deathSaves.successes;
              return (
                <button
                  key={`success-${i}`}
                  type="button"
                  onClick={() => handleToggle("successes", i)}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${
                    isChecked 
                      ? "bg-green-600 border-green-600 shadow-sm" 
                      : "border-[var(--dnd-accent-soft)] hover:border-green-500"
                  }`}
                  aria-label={`Succès ${i + 1}`}
                />
              );
            })}
          </div>
        </div>

        {/* Échecs */}
        <div className="flex items-center justify-between bg-black/5 dark:bg-white/5 p-2.5 rounded-md">
          <span className="text-xs font-semibold uppercase tracking-wider">Échecs</span>
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => {
              const isChecked = i < deathSaves.failures;
              return (
                <button
                  key={`failure-${i}`}
                  type="button"
                  onClick={() => handleToggle("failures", i)}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${
                    isChecked 
                      ? "bg-red-600 border-red-600 shadow-sm" 
                      : "border-[var(--dnd-accent-soft)] hover:border-red-500"
                  }`}
                  aria-label={`Échec ${i + 1}`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}