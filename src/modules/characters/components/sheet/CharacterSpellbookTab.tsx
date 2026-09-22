"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { type CharacterNewSpellState, type CharacterSpellEntry } from "@/modules/characters/components/sheet/shared";

type SpellOption = {
  id: string;
  name: string;
  level: number;
  school?: string | null;
  range?: string | null;
  castingTime?: string | null;
  components?: string | Record<string, boolean> | string[] | null;
  concentration?: boolean;
  description?: string | null;
};

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
  availableSpells?: SpellOption[];
};

function formatSpellComponents(components: unknown): string {
  if (!components) return "Aucune";
  if (Array.isArray(components)) {
    const list = components.filter((c): c is string => typeof c === "string" && c.trim().length > 0);
    return list.length > 0 ? list.join(", ") : "Aucune";
  }
  if (typeof components === "string" && components.trim()) {
    return components.trim();
  }
  if (typeof components === "object") {
    const active = Object.entries(components as Record<string, boolean>)
      .filter(([_, val]) => Boolean(val))
      .map(([key]) => key.toUpperCase());
    return active.length > 0 ? active.join(", ") : "Aucune";
  }
  return "Aucune";
}

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
  availableSpells = [],
}: CharacterSpellbookTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>("ALL");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCustomMode, setIsCustomMode] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const [levelSearches, setLevelSearches] = useState<Record<string, string>>({});

  const handleLevelSearchChange = (key: string, value: string) => {
    setLevelSearches((prev) => ({ ...prev, [key]: value }));
  };

  const normalizedCantrips = useMemo(() => {
    const list = [...(cantrips ?? [])];
    for (const spell of leveledSpells ?? []) {
      if (Number(spell.level) === 0 && !list.some((c) => c.id === spell.id)) {
        list.push(spell);
      }
    }
    return list;
  }, [cantrips, leveledSpells]);

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

  const [collapsedLevels, setCollapsedLevels] = useState<Record<string, boolean>>({});

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

  const filteredSpells = useMemo(() => {
    return availableSpells.filter((spell) => {
      const matchesLevel = selectedLevelFilter === "ALL" || Number(spell.level) === Number(selectedLevelFilter);
      const query = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !query ||
        spell.name.toLowerCase().includes(query) ||
        (spell.school && spell.school.toLowerCase().includes(query)) ||
        (spell.description && spell.description.toLowerCase().includes(query));

      return matchesLevel && matchesSearch;
    });
  }, [availableSpells, searchTerm, selectedLevelFilter]);

  const handleSelectSpell = (spell: SpellOption) => {
    setNewSpell({
      name: spell.name,
      level: spell.level,
      school: spell.school ?? "Évocation",
      range: spell.range ?? "18 m",
      castingTime: spell.castingTime ?? "1 action",
      components: formatSpellComponents(spell.components),
      concentration: spell.concentration ?? false,
      description: spell.description ?? "",
    });
    setSearchTerm(spell.name);
    setIsDropdownOpen(false);
  };

  const handleAddSpell = () => {
    if (!newSpell.name.trim()) return;
    const spellToAdd: CharacterSpellEntry = {
      id: `custom-spell-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: newSpell.name.trim(),
      level: Number(newSpell.level),
      school: newSpell.school,
      range: newSpell.range,
      castingTime: newSpell.castingTime,
      components:
        typeof newSpell.components === "string"
          ? newSpell.components.split(",").map((c) => c.trim()).filter(Boolean)
          : newSpell.components,
      concentration: newSpell.concentration,
      description: newSpell.description.trim() || "Aucune description.",
    };
    setDraftSpells((current) => [...current, spellToAdd]);
    setNewSpell({
      name: "",
      level: 0,
      school: "Évocation",
      range: "18 m",
      castingTime: "1 action",
      components: "V, S",
      concentration: false,
      description: "",
    });
    setSearchTerm("");
    setIsCustomMode(false);
  };

  const handleRemoveSpell = (id: string) => {
    setDraftSpells((current) => current.filter((spell) => spell.id !== id));
  };

  const safeSlots = Array.isArray(slots) && slots.length === 9 ? slots : Array(9).fill(0);

  return (
    <section
      className="mt-4 rounded-lg border p-4"
      style={{ borderColor: "var(--dnd-accent-soft)", background: "var(--dnd-surface)" }}
    >
      {/* 1. Emplacements de Sorts (Slots 1 à 9 avec dépense et recharge) */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-[var(--dnd-ink)]">Emplacements de Sorts</h4>
          <span className="text-[11px] opacity-70 italic">Clic gauche : dépenser · Clic droit : recharger</span>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-9">
          {safeSlots.map((total, index) => (
            <button
              key={`slot-${index}`}
              type="button"
              onClick={() =>
                setSlots((current) =>
                  (current ?? Array(9).fill(0)).map((value, slot) => (slot === index && value > 0 ? value - 1 : value))
                )
              }
              onContextMenu={(e) => {
                e.preventDefault();
                setSlots((current) =>
                  (current ?? Array(9).fill(0)).map((value, slot) => (slot === index ? value + 1 : value))
                );
              }}
              className="group flex flex-col items-center rounded-lg border p-2 transition-all hover:border-[var(--dnd-accent)] active:scale-95 select-none"
              style={{
                borderColor: total > 0 ? "var(--dnd-accent)" : "var(--dnd-accent-soft)",
                background: total > 0 ? "var(--dnd-accent-soft)" : "transparent",
              }}
              title="Clic gauche: -1 | Clic droit: +1"
            >
              <span
                className="text-[10px] font-bold uppercase tracking-wider"
                style={{ color: total > 0 ? "var(--dnd-accent)" : "var(--dnd-muted)" }}
              >
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

      {/* 3. Formulaire d'ajout interactif et combobox */}
      {editing && (
        <div className="mb-6 rounded-lg border border-dashed p-4 relative" style={{ borderColor: "var(--dnd-accent)" }}>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-sm">
              {isCustomMode ? "Créer un sort personnalisé" : "Ajouter un sort depuis le compendium"}
            </h4>
            <button
              type="button"
              onClick={() => {
                setIsCustomMode(!isCustomMode);
                setNewSpell({
                  name: "",
                  level: 0,
                  school: "Évocation",
                  range: "18 m",
                  castingTime: "1 action",
                  components: "V, S",
                  concentration: false,
                  description: "",
                });
                setSearchTerm("");
              }}
              className="text-xs font-semibold underline hover:opacity-80"
              style={{ color: "var(--dnd-accent)" }}
            >
              {isCustomMode ? "← Revenir au compendium" : "+ Créer un sort custom"}
            </button>
          </div>

          {!isCustomMode ? (
            <div ref={dropdownRef}>
              {/* Filtres de niveau */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {[
                  { label: "Tous", value: "ALL" },
                  { label: "Tours (0)", value: "0" },
                  ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => ({ label: `Niv. ${lvl}`, value: String(lvl) })),
                ].map((lvlCat) => (
                  <button
                    key={lvlCat.value}
                    type="button"
                    onClick={() => {
                      setSelectedLevelFilter(lvlCat.value);
                      if (lvlCat.value !== "ALL") {
                        setNewSpell((current) => ({ ...current, level: Number(lvlCat.value) }));
                      }
                      setIsDropdownOpen(true);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      selectedLevelFilter === lvlCat.value ? "text-white shadow-sm" : "opacity-70 hover:opacity-100 border"
                    }`}
                    style={{
                      backgroundColor: selectedLevelFilter === lvlCat.value ? "var(--dnd-accent)" : "transparent",
                      borderColor: "var(--dnd-accent-soft)",
                    }}
                  >
                    {lvlCat.label}
                  </button>
                ))}
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-3 relative">
                <div className="relative sm:col-span-3">
                  <input
                    type="text"
                    placeholder={
                      selectedLevelFilter === "ALL"
                        ? "Rechercher un sort..."
                        : `Rechercher un sort de niveau ${selectedLevelFilter}...`
                    }
                    value={searchTerm}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSearchTerm(val);
                      setIsDropdownOpen(true);
                      if (!val.trim()) {
                        setNewSpell((current) => ({ ...current, name: "", description: "" }));
                      } else {
                        setNewSpell((current) => ({ ...current, name: val }));
                      }
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                    style={{
                      borderColor: "var(--dnd-accent-soft)",
                      backgroundColor: "var(--dnd-surface)",
                      color: "inherit",
                    }}
                  />

                  {isDropdownOpen && filteredSpells.length > 0 && (
                    <ul
                      className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border shadow-lg"
                      style={{ borderColor: "var(--dnd-accent-soft)", backgroundColor: "var(--dnd-surface)" }}
                    >
                      {filteredSpells.map((spell) => (
                        <li
                          key={spell.id}
                          onClick={() => handleSelectSpell(spell)}
                          className="cursor-pointer px-3 py-2 text-xs sm:text-sm transition-colors hover:bg-black/10 dark:hover:bg-white/10 flex justify-between items-center"
                        >
                          <div>
                            <span className="font-medium">{spell.name}</span>
                            <span
                              className="ml-2 text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--dnd-accent-soft)] opacity-80"
                              style={{ color: "var(--dnd-accent)" }}
                            >
                              {spell.level === 0 ? "Tour de magie" : `Niveau ${spell.level}`}
                            </span>
                          </div>
                          {spell.school && <span className="text-[10px] opacity-60 italic ml-2">{spell.school}</span>}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <textarea
                  placeholder="Description complète du sort..."
                  value={newSpell.description}
                  onChange={(e) => setNewSpell({ ...newSpell, description: e.target.value })}
                  className="rounded border bg-transparent px-2.5 py-2 text-sm sm:col-span-3 outline-none"
                  rows={4}
                  style={{
                    borderColor: "var(--dnd-accent-soft)",
                    backgroundColor: "var(--dnd-surface)",
                    color: "inherit",
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <input
                placeholder="Nom du sort"
                value={newSpell.name}
                onChange={(e) => setNewSpell({ ...newSpell, name: e.target.value })}
                className="rounded border bg-transparent px-2 py-1 text-sm outline-none"
                style={{
                  borderColor: "var(--dnd-accent-soft)",
                  backgroundColor: "var(--dnd-surface)",
                  color: "inherit",
                }}
              />
              <select
                value={newSpell.level}
                onChange={(e) => setNewSpell({ ...newSpell, level: Number(e.target.value) })}
                className="rounded border bg-transparent px-2 py-1 text-sm outline-none"
                style={{
                  borderColor: "var(--dnd-accent-soft)",
                  backgroundColor: "var(--dnd-surface)",
                  color: "inherit",
                }}
              >
                <option value={0}>Tour de magie (Niveau 0)</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => (
                  <option key={`opt-lvl-${lvl}`} value={lvl}>
                    Sort Niveau {lvl}
                  </option>
                ))}
              </select>
              <input
                placeholder="École (ex: Évocation)"
                value={newSpell.school}
                onChange={(e) => setNewSpell({ ...newSpell, school: e.target.value })}
                className="rounded border bg-transparent px-2 py-1 text-sm outline-none"
                style={{
                  borderColor: "var(--dnd-accent-soft)",
                  backgroundColor: "var(--dnd-surface)",
                  color: "inherit",
                }}
              />
              <input
                placeholder="Portée (ex: 18 m)"
                value={newSpell.range}
                onChange={(e) => setNewSpell({ ...newSpell, range: e.target.value })}
                className="rounded border bg-transparent px-2 py-1 text-sm outline-none"
                style={{
                  borderColor: "var(--dnd-accent-soft)",
                  backgroundColor: "var(--dnd-surface)",
                  color: "inherit",
                }}
              />
              <input
                placeholder="Temps d'incantation"
                value={newSpell.castingTime}
                onChange={(e) => setNewSpell({ ...newSpell, castingTime: e.target.value })}
                className="rounded border bg-transparent px-2 py-1 text-sm outline-none"
                style={{
                  borderColor: "var(--dnd-accent-soft)",
                  backgroundColor: "var(--dnd-surface)",
                  color: "inherit",
                }}
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={newSpell.concentration}
                  onChange={(e) => setNewSpell({ ...newSpell, concentration: e.target.checked })}
                />
                Nécessite concentration
              </label>
              <textarea
                placeholder="Description complète du sort..."
                value={newSpell.description}
                onChange={(e) => setNewSpell({ ...newSpell, description: e.target.value })}
                className="rounded border bg-transparent px-2.5 py-2 text-sm sm:col-span-3 outline-none"
                rows={4}
                style={{
                  borderColor: "var(--dnd-accent-soft)",
                  backgroundColor: "var(--dnd-surface)",
                  color: "inherit",
                }}
              />
            </div>
          )}

          <button
            type="button"
            onClick={handleAddSpell}
            className="mt-3 rounded px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:opacity-90"
            style={{ background: "var(--dnd-accent)" }}
          >
            + Ajouter le sort
          </button>
        </div>
      )}

      {/* 4. Section Collapsible : Tours de Magie */}
      {(normalizedCantrips.length > 0 || editing) && (() => {
        const cantripFilter = (levelSearches["cantrips"] ?? "").toLowerCase();
        const filteredCantripsList = normalizedCantrips.filter(
          (s) => s.name.toLowerCase().includes(cantripFilter) || (s.description && s.description.toLowerCase().includes(cantripFilter))
        );

        return (
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
                <span className="text-xs text-[var(--dnd-muted)] font-mono">({filteredCantripsList.length})</span>
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
                {normalizedCantrips.length > 3 && (
                  <input
                    type="text"
                    placeholder="Filtrer les tours de magie..."
                    value={levelSearches["cantrips"] ?? ""}
                    onChange={(e) => handleLevelSearchChange("cantrips", e.target.value)}
                    className="w-full rounded-lg border px-2.5 py-1 text-xs outline-none mb-3"
                    style={{
                      borderColor: "var(--dnd-accent-soft)",
                      backgroundColor: "var(--dnd-surface)",
                      color: "inherit",
                    }}
                  />
                )}
                <div className="grid gap-3 sm:grid-cols-2">
                  {filteredCantripsList.map((spell, idx) => (
                    <article
                      key={spell.id ? `cantrip-${spell.id}` : `cantrip-idx-${idx}`}
                      className="relative rounded-md border p-3 text-sm"
                      style={{ borderColor: "var(--dnd-accent-soft)" }}
                    >
                      {editing && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSpell(spell.id)}
                          className="absolute right-2 top-2 text-xs text-red-600 hover:underline"
                        >
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
        );
      })()}

      {/* 5. Sections Collapsibles : Sorts par niveau (1 à 9) */}
      <div className="mt-4 space-y-3">
        {Array.from({ length: 9 }, (_, index) => {
          const level = index + 1;
          const spells = spellsByLevel.get(level) ?? [];
          const slotTotal = safeSlots[index] ?? 0;
          const isCollapsed = collapsedLevels[`level-${level}`] ?? false;

          if (spells.length === 0 && !editing) {
            return null;
          }

          const lvlQuery = (levelSearches[`level-${level}`] ?? "").toLowerCase();
          const filteredLevelSpells = spells.filter(
            (s) => s.name.toLowerCase().includes(lvlQuery) || (s.description && s.description.toLowerCase().includes(lvlQuery))
          );

          return (
            <div
              key={`spell-level-section-${level}`}
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
                    ({filteredLevelSpells.length} sort{filteredLevelSpells.length > 1 ? "s" : ""}
                    {slotTotal > 0 ? ` • ${slotTotal} emplacement${slotTotal > 1 ? "s" : ""}` : ""})
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
                  {spells.length > 3 && (
                    <input
                      type="text"
                      placeholder={`Filtrer les sorts de niveau ${level}...`}
                      value={levelSearches[`level-${level}`] ?? ""}
                      onChange={(e) => handleLevelSearchChange(`level-${level}`, e.target.value)}
                      className="w-full rounded-lg border px-2.5 py-1 text-xs outline-none mb-3"
                      style={{
                        borderColor: "var(--dnd-accent-soft)",
                        backgroundColor: "var(--dnd-surface)",
                        color: "inherit",
                      }}
                    />
                  )}
                  <div className="grid gap-3 sm:grid-cols-2">
                    {filteredLevelSpells.map((spell, idx) => {
                      const componentsLabel = formatSpellComponents(spell.components);
                      return (
                        <article
                          key={spell.id ? `spell-item-${spell.id}` : `spell-item-idx-${level}-${idx}`}
                          className="relative rounded-md border p-3 text-sm"
                          style={{ borderColor: "var(--dnd-accent-soft)" }}
                        >
                          {editing && (
                            <button
                              type="button"
                              onClick={() => handleRemoveSpell(spell.id)}
                              className="absolute right-2 top-2 text-xs text-red-600 hover:underline"
                            >
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