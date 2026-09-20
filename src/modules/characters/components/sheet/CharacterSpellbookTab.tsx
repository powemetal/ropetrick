"use client";

import { useState, useMemo, useEffect } from "react";
import { type CharacterNewSpellState, type CharacterSpellEntry } from "@/modules/characters/components/sheet/shared";

type CharacterSpellbookTabProps = {
  editing: boolean;
  spellSaveDc: number;
  spellAttackBonus: number;
  cantrips: CharacterSpellEntry[];
  leveledSpells: CharacterSpellEntry[];
  newSpell: CharacterNewSpellState;
  setNewSpell: (value: CharacterNewSpellState | ((current: CharacterNewSpellState) => CharacterNewSpellState)) => void;
  setDraftSpells: (value: CharacterSpellEntry[] | ((current: CharacterSpellEntry[]) => CharacterSpellEntry[])) => void;
  slots: number[];
  setSlots: (value: number[] | ((current: number[]) => number[])) => void;
};

export function CharacterSpellbookTab({
  editing,
  spellSaveDc,
  spellAttackBonus,
  cantrips,
  leveledSpells,
  newSpell,
  setNewSpell,
  setDraftSpells,
  slots,
  setSlots,
}: CharacterSpellbookTabProps) {
  // Réconciliation tolérante pour les tours de magie (0, "0", ou non défini)
  const normalizedCantrips = useMemo(() => {
    const list = [...(cantrips ?? [])];
    // Si des sorts de niveau 0 se sont glissés dans leveledSpells, on les rapatrie
    for (const spell of leveledSpells ?? []) {
      if (Number(spell.level) === 0 && !list.some((c) => c.id === spell.id)) {
        list.push(spell);
      }
    }
    return list;
  }, [cantrips, leveledSpells]);

  // Regroupement des sorts de niveau 1 à 9
  const spellsByLevel = useMemo(() => {
    const map = new Map<number, CharacterSpellEntry[]>();
    for (let i = 1; i <= 9; i++) {
      map.set(i, []);
    }
    for (const spell of leveledSpells ?? []) {
      const lvl = Number(spell.level);
      if (lvl >= 1 && lvl <= 9) {
        const list = map.get(lvl) ?? [];
        list.push(spell);
        map.set(lvl, list);
      }
    }
    return map;
  }, [leveledSpells]);

  // Initialisation neutre pour éviter l'erreur d'hydratation SSR / Client
  const [collapsedLevels, setCollapsedLevels] = useState<Record<string, boolean>>({});

  // Chargement différé du localStorage après le montage client
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("dnd_sheet_collapsed_spell_levels");
        if (saved) {
          setCollapsedLevels(JSON.parse(saved));
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("dnd_sheet_collapsed_spell_levels", JSON.stringify(collapsedLevels));
    } catch (e) {
      console.error(e);
    }
  }, [collapsedLevels]);

  const toggleLevel = (key: string) => {
    setCollapsedLevels((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAddSpell = () => {
    if (!newSpell.name.trim()) return;
    const spellToAdd: CharacterSpellEntry = {
      id: `temp-spell-${Date.now()}`,
      name: newSpell.name.trim(),
      level: Number(newSpell.level),
      school: newSpell.school,
      range: newSpell.range,
      castingTime: newSpell.castingTime,
      components: typeof newSpell.components === "string"
        ? newSpell.components.split(",").map((c) => c.trim())
        : newSpell.components,
      concentration: newSpell.concentration,
      description: newSpell.description.trim() || "Aucune description.",
    };
    setDraftSpells((current) => [...current, spellToAdd]);
    setNewSpell({ name: "", level: 0, school: "Évocation", range: "18 m", castingTime: "1 action", components: "V, S", concentration: false, description: "" });
  };

  const handleRemoveSpell = (id: string) => {
    setDraftSpells((current) => current.filter((spell) => spell.id !== id));
  };

  return (
    <section className="mt-4 rounded-lg border p-4" style={{ borderColor: "var(--dnd-accent-soft)", background: "var(--dnd-surface)" }}>
      {/* 1. Emplacements de Sorts (Slots 1 à 9) */}
      <div className="mb-6">
        <h4 className="font-semibold text-[var(--dnd-ink)]">Emplacements de Sorts</h4>
        <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-9">
          {slots.map((total, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setSlots((current) => current.map((value, slot) => (slot === index && value > 0 ? value - 1 : value)))}
              className="group flex flex-col items-center rounded-lg border p-2 transition-all hover:border-[var(--dnd-accent)] active:scale-95"
              style={{
                borderColor: total > 0 ? "var(--dnd-accent)" : "var(--dnd-accent-soft)",
                background: total > 0 ? "var(--dnd-accent-soft)" : "transparent",
              }}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: total > 0 ? "var(--dnd-accent)" : "var(--dnd-muted)" }}>
                Niv. {index + 1}
              </span>
              <strong className="text-lg leading-none mt-1">{total}</strong>
            </button>
          ))}
        </div>
      </div>

      {/* 2. DD & Bonus d'attaque */}
      <div className="mb-6 flex flex-wrap gap-4">
        <Tracker label="DD de sauvegarde" value={spellSaveDc} />
        <Tracker label="Bonus d'attaque de sort" value={`${spellAttackBonus >= 0 ? "+" : ""}${spellAttackBonus}`} />
      </div>

      {/* 3. Formulaire d'ajout en mode édition */}
      {editing && (
        <div className="mb-6 rounded-lg border border-dashed p-4" style={{ borderColor: "var(--dnd-accent)" }}>
          <h4 className="font-semibold text-sm">Ajouter un sort au grimoire</h4>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <input placeholder="Nom du sort" value={newSpell.name} onChange={(e) => setNewSpell({ ...newSpell, name: e.target.value })} className="rounded border bg-transparent px-2 py-1 text-sm" />
            <select value={newSpell.level} onChange={(e) => setNewSpell({ ...newSpell, level: Number(e.target.value) })} className="rounded border bg-transparent px-2 py-1 text-sm">
              <option value={0}>Tour de magie (Niveau 0)</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => (
                <option key={lvl} value={lvl}>
                  Sort Niveau {lvl}
                </option>
              ))}
            </select>
            <input placeholder="École (ex: Évocation)" value={newSpell.school} onChange={(e) => setNewSpell({ ...newSpell, school: e.target.value })} className="rounded border bg-transparent px-2 py-1 text-sm" />
            <input placeholder="Portée (ex: 18 m)" value={newSpell.range} onChange={(e) => setNewSpell({ ...newSpell, range: e.target.value })} className="rounded border bg-transparent px-2 py-1 text-sm" />
            <input placeholder="Temps d'incantation" value={newSpell.castingTime} onChange={(e) => setNewSpell({ ...newSpell, castingTime: e.target.value })} className="rounded border bg-transparent px-2 py-1 text-sm" />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={newSpell.concentration} onChange={(e) => setNewSpell({ ...newSpell, concentration: e.target.checked })} />
              Nécessite concentration
            </label>
            <textarea placeholder="Description complète du sort..." value={newSpell.description} onChange={(e) => setNewSpell({ ...newSpell, description: e.target.value })} className="rounded border bg-transparent px-2 py-1 text-sm sm:col-span-3" rows={2} />
          </div>
          <button type="button" onClick={handleAddSpell} className="mt-3 rounded px-3 py-1.5 text-xs font-semibold text-white" style={{ background: "var(--dnd-accent)" }}>
            + Ajouter le sort
          </button>
        </div>
      )}

      {/* 4. Section Collapsible : Tours de Magie */}
      {(normalizedCantrips.length > 0 || editing) && (
        <div
          className="overflow-hidden rounded-lg border transition-all duration-150 hover:border-[var(--dnd-accent)]"
          style={{ borderColor: "var(--dnd-accent-soft)" }}
        >
          <button
            type="button"
            onClick={() => toggleLevel("cantrips")}
            className="group flex w-full items-center justify-between px-4 py-3 text-left transition-all duration-150 hover:bg-[color-mix(in_srgb,var(--dnd-accent)_15%,transparent)] active:scale-[0.99]"
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[var(--dnd-ink)]">Tours de Magie (Cantrips)</span>
              <span className="text-xs text-[var(--dnd-muted)] font-mono">({normalizedCantrips.length})</span>
            </div>
            <span
              className="text-base font-bold transition-all duration-200 group-hover:scale-125"
              style={{
                transform: collapsedLevels.cantrips ? "rotate(-90deg)" : "rotate(0deg)",
                color: "var(--dnd-accent)",
              }}
            >
              ▾
            </span>
          </button>

          <div
            className={`transition-all duration-300 ease-in-out ${
              collapsedLevels.cantrips ? "max-h-0 opacity-0 overflow-hidden" : "max-h-[3000px] opacity-100"
            }`}
          >
            <div className="p-4 pt-0">
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                {normalizedCantrips.map((spell) => (
                  <article key={spell.id} className="relative rounded-md border p-3 text-sm" style={{ borderColor: "var(--dnd-accent-soft)" }}>
                    {editing && (
                      <button type="button" onClick={() => handleRemoveSpell(spell.id)} className="absolute right-2 top-2 text-xs text-red-600 hover:underline">
                        Supprimer
                      </button>
                    )}
                    <strong>{spell.name}</strong>
                    <p className="mt-2 whitespace-pre-wrap leading-6 text-xs" style={{ color: "var(--dnd-muted)" }}>
                      {spell.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Sections Collapsibles : Sorts par niveau */}
      <div className="mt-4 space-y-3">
        {Array.from({ length: 9 }, (_, index) => {
          const level = index + 1;
          const spells = spellsByLevel.get(level) ?? [];
          const slotTotal = slots[index] ?? 0;
          const isCollapsed = collapsedLevels[`level-${level}`] ?? false;

          if (spells.length === 0 && !editing) {
            return null;
          }

          return (
            <div
              key={level}
              className="overflow-hidden rounded-lg border transition-all duration-150 hover:border-[var(--dnd-accent)]"
              style={{ borderColor: "var(--dnd-accent-soft)" }}
            >
              <button
                type="button"
                onClick={() => toggleLevel(`level-${level}`)}
                className="group flex w-full items-center justify-between px-4 py-3 text-left transition-all duration-150 hover:bg-[color-mix(in_srgb,var(--dnd-accent)_15%,transparent)] active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-[var(--dnd-ink)]">Sorts de Niveau {level}</span>
                  <span className="text-xs text-[var(--dnd-muted)] font-mono">
                    ({spells.length} sort{spells.length > 1 ? "s" : ""}{slotTotal > 0 ? ` • ${slotTotal} emplacement${slotTotal > 1 ? "s" : ""}` : ""})
                  </span>
                </div>
                <span
                  className="text-base font-bold transition-all duration-200 group-hover:scale-125"
                  style={{
                    transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)",
                    color: "var(--dnd-accent)",
                  }}
                >
                  ▾
                </span>
              </button>

              <div
                className={`transition-all duration-300 ease-in-out ${
                  isCollapsed ? "max-h-0 opacity-0 overflow-hidden" : "max-h-[3000px] opacity-100"
                }`}
              >
                <div className="p-4 pt-0">
                  <div className="mt-2 grid gap-3 sm:grid-cols-2">
                    {spells.map((spell) => {
                      const componentsLabel = Array.isArray(spell.components)
                        ? spell.components.filter((entry): entry is string => typeof entry === "string").join(", ")
                        : "Aucune";
                      return (
                        <article key={spell.id} className="relative rounded-md border p-3 text-sm" style={{ borderColor: "var(--dnd-accent-soft)" }}>
                          {editing && (
                            <button type="button" onClick={() => handleRemoveSpell(spell.id)} className="absolute right-2 top-2 text-xs text-red-600 hover:underline">
                              Supprimer
                            </button>
                          )}
                          <strong>{spell.name}</strong>
                          <p className="mt-1 text-xs" style={{ color: "var(--dnd-muted)" }}>
                            École {spell.school} · Portée {spell.range} · Incantation {spell.castingTime} · Composantes {componentsLabel} · {spell.concentration ? "Concentration" : "Sans concentration"}
                          </p>
                          <p className="mt-2 whitespace-pre-wrap leading-6 text-xs" style={{ color: "var(--dnd-muted)" }}>
                            {spell.description}
                          </p>
                        </article>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

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