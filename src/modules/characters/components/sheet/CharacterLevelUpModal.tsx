"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { type Ability } from "@/modules/characters/engine/dnd-rules-engine";
import { abilityLabels } from "@/modules/characters/components/sheet/shared";

export type SubclassOption = {
  id: string;
  name: string;
  description?: string | null;
};

export type LevelUpFeatOption = {
  id: string;
  name: string;
  description?: string | null;
};

export type LevelUpSpellOption = {
  id: string;
  name: string;
  level: number;
  school?: string | null;
  description?: string | null;
};

export type CharacterLevelUpModalProps = {
  level: number;
  currentClassName?: string;
  hasSubclass?: boolean;
  availableSubclasses?: SubclassOption[];
  availableFeats?: LevelUpFeatOption[];
  availableSpells?: LevelUpSpellOption[];
  spellSelectionCount?: number;
  maxSpellLevel?: number;
  selectedSpellIds?: string[];
  setSelectedSpellIds?: (spells: string[]) => void;
  pending: boolean;
  hitPointMethod: "AVERAGE" | "ROLL";
  setHitPointMethod: (value: "AVERAGE" | "ROLL") => void;
  abilityIncrease: Partial<Record<Ability, number>>;
  setAbilityIncrease: (value: Partial<Record<Ability, number>>) => void;
  feat: string;
  setFeat: (value: string) => void;
  subclassId: string;
  setSubclassId: (value: string) => void;
  newClassName: string;
  setNewClassName: (value: string) => void;
  multiclassEligibility: { eligible: boolean; reasons: string[] };
  legalAsiLevels: number[];
  onCancel: () => void;
  onConfirm: () => void;
};

const DND_CLASSES = [
  "Barbare",
  "Barde",
  "Clerc",
  "Druide",
  "Guerrier",
  "Moine",
  "Paladin",
  "Rôdeur",
  "Roublard",
  "Ensorceleur",
  "Occultiste",
  "Magicien",
  "Artificier",
];

export function CharacterLevelUpModal({
  level,
  currentClassName = "Guerrier",
  hasSubclass = false,
  availableSubclasses = [],
  availableFeats = [],
  availableSpells = [],
  spellSelectionCount = 0,
  maxSpellLevel = 1,
  selectedSpellIds = [],
  setSelectedSpellIds,
  pending,
  hitPointMethod,
  setHitPointMethod,
  abilityIncrease,
  setAbilityIncrease,
  feat,
  setFeat,
  subclassId,
  setSubclassId,
  newClassName,
  setNewClassName,
  multiclassEligibility,
  legalAsiLevels,
  onCancel,
  onConfirm,
}: CharacterLevelUpModalProps) {
  const targetLevel = level + 1;
  const isAsiLevel = legalAsiLevels.includes(targetLevel);

  // Sous-classe : UNIQUEMENT au niveau 3 si le personnage n'en a pas
  const needsSubclassSelection = targetLevel === 3 && !hasSubclass && !newClassName;

  // Choix exclusif Caractéristiques vs Don
  const [asiMode, setAsiMode] = useState<"STATS" | "FEAT">("STATS");

  // Combobox Sous-classe
  const [subclassOpen, setSubclassOpen] = useState(false);
  const [subclassSearch, setSubclassSearch] = useState("");
  const subclassRef = useRef<HTMLDivElement>(null);

  // Combobox Dons
  const [featOpen, setFeatOpen] = useState(false);
  const [featSearch, setFeatSearch] = useState("");
  const featRef = useRef<HTMLDivElement>(null);

  // Fermeture des menus au clic extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (subclassRef.current && !subclassRef.current.contains(event.target as Node)) {
        setSubclassOpen(false);
      }
      if (featRef.current && !featRef.current.contains(event.target as Node)) {
        setFeatOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const totalStatsAssigned = useMemo(() => {
    return Object.values(abilityIncrease).reduce((acc, v) => acc + (v ?? 0), 0);
  }, [abilityIncrease]);

  const filteredSubclasses = useMemo(() => {
    if (!subclassSearch.trim()) return availableSubclasses;
    const q = subclassSearch.toLowerCase();
    return availableSubclasses.filter((s) => s.name.toLowerCase().includes(q));
  }, [availableSubclasses, subclassSearch]);

  const filteredFeats = useMemo(() => {
    if (!featSearch.trim()) return availableFeats;
    const q = featSearch.toLowerCase();
    return availableFeats.filter((f) => f.name.toLowerCase().includes(q));
  }, [availableFeats, featSearch]);

  const selectedSubclassObj = availableSubclasses.find((s) => s.id === subclassId);
  const selectedFeatObj = availableFeats.find((f) => f.id === feat || f.name === feat);

  // Conditions de validation du bouton de soumission
  const isSubclassBlocked = needsSubclassSelection && !subclassId;
  const isAsiBlocked =
    isAsiLevel &&
    ((asiMode === "STATS" && totalStatsAssigned !== 2) ||
      (asiMode === "FEAT" && !feat.trim()));
  const canValidateSpellSelection = availableSpells.length >= spellSelectionCount;
  const isSpellBlocked =
    spellSelectionCount > 0 &&
    canValidateSpellSelection &&
    selectedSpellIds.length !== spellSelectionCount;
  const isMulticlassBlocked = Boolean(newClassName && !multiclassEligibility.eligible);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="flex max-h-[85vh] w-full max-w-xl flex-col rounded-xl border bg-stone-950 text-stone-100 shadow-2xl"
        style={{ borderColor: "var(--dnd-accent)" }}
      >
        {/* En-tête */}
        <div className="flex shrink-0 items-start justify-between border-b border-stone-800 p-4 sm:p-5">
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-amber-500">
              Progression de classe
            </p>
            <h3 className="mt-0.5 text-xl font-bold">
              {currentClassName} — Niveau {level} →{" "}
              <span className="text-amber-400">{targetLevel}</span>
            </h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Fermer"
            className="text-2xl text-stone-400 hover:text-stone-200"
          >
            ×
          </button>
        </div>

        {/* Corps avec défilement interne */}
        <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
          {/* Multiclassage */}
          <div className="rounded-lg border border-stone-800 bg-stone-900/40 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-300">
                Orientation de classe
              </label>
              <select
                value={newClassName}
                onChange={(e) => {
                  setNewClassName(e.target.value);
                  if (e.target.value) setSubclassId("");
                }}
                className="rounded border border-stone-700 bg-stone-900 px-2.5 py-1 text-xs text-stone-200 outline-none"
              >
                <option value="">Continuer en {currentClassName}</option>
                {DND_CLASSES.filter(
                  (c) => c.toLowerCase() !== currentClassName.toLowerCase()
                ).map((c) => (
                  <option key={c} value={c}>
                    Multiclasser en {c}
                  </option>
                ))}
              </select>
            </div>
            {newClassName && !multiclassEligibility.eligible && (
              <p className="mt-1.5 text-xs text-amber-400">
                ⚠️ Inéligible : {multiclassEligibility.reasons.join(" ")}
              </p>
            )}
          </div>

          {/* Points de vie */}
          <div className="rounded-lg border border-stone-800 bg-stone-900/40 p-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-400 block mb-2">
              Gain de Points de Vie
            </span>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex cursor-pointer items-center gap-2 rounded border border-stone-800 bg-stone-900 px-3 py-2 text-xs">
                <input
                  type="radio"
                  name="hpMethod"
                  checked={hitPointMethod === "AVERAGE"}
                  onChange={() => setHitPointMethod("AVERAGE")}
                />
                <span>Moyenne officielle</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2 rounded border border-stone-800 bg-stone-900 px-3 py-2 text-xs">
                <input
                  type="radio"
                  name="hpMethod"
                  checked={hitPointMethod === "ROLL"}
                  onChange={() => setHitPointMethod("ROLL")}
                />
                <span>Tirer le dé</span>
              </label>
            </div>
          </div>

          {/* Sous-classe (Stricte : Niveau 3 uniquement) */}
          {needsSubclassSelection && (
            <div className="rounded-lg border border-amber-500/40 bg-amber-950/20 p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Sous-classe obligatoire
                </span>
                <span className="font-mono text-[10px] text-amber-400">Palier Niveau 3</span>
              </div>
              <div className="relative" ref={subclassRef}>
                <button
                  type="button"
                  onClick={() => setSubclassOpen((v) => !v)}
                  className="flex w-full items-center justify-between rounded border border-stone-700 bg-stone-900 px-3 py-2 text-left text-xs"
                >
                  <span
                    className={
                      selectedSubclassObj ? "font-semibold text-amber-200" : "text-stone-400"
                    }
                  >
                    {selectedSubclassObj
                      ? selectedSubclassObj.name
                      : "Sélectionner votre sous-classe..."}
                  </span>
                  <span>▾</span>
                </button>
                {subclassOpen && (
                  <div className="absolute left-0 right-0 top-full z-40 mt-1 max-h-48 overflow-hidden rounded border border-stone-700 bg-stone-900 shadow-xl">
                    <input
                      autoFocus
                      type="text"
                      value={subclassSearch}
                      onChange={(e) => setSubclassSearch(e.target.value)}
                      placeholder="Filtrer les archétypes..."
                      className="w-full border-b border-stone-800 bg-stone-950 p-2 text-xs text-stone-100 outline-none"
                    />
                    <ul className="max-h-36 overflow-y-auto p-1 text-xs">
                      {filteredSubclasses.map((s) => (
                        <li key={s.id}>
                          <button
                            type="button"
                            onClick={() => {
                              setSubclassId(s.id);
                              setSubclassOpen(false);
                            }}
                            className="w-full rounded px-2 py-1.5 text-left hover:bg-stone-800 text-stone-200"
                          >
                            <p className="font-semibold">{s.name}</p>
                            {s.description && (
                              <p className="text-[10px] text-stone-400 truncate">
                                {s.description}
                              </p>
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ASI / Dons : Choix exclusif */}
          {isAsiLevel && (
            <div className="rounded-lg border border-stone-800 bg-stone-900/40 p-3">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-300 block mb-2">
                Amélioration de Caractéristiques ou Don (Choix unique)
              </span>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => {
                    setAsiMode("STATS");
                    setFeat("");
                  }}
                  className={`rounded border p-2 text-xs font-semibold transition-all ${
                    asiMode === "STATS"
                      ? "border-amber-500 bg-amber-950/40 text-amber-200"
                      : "border-stone-800 bg-stone-900 text-stone-400"
                  }`}
                >
                  +2 Caractéristiques (ou 2x +1)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAsiMode("FEAT");
                    setAbilityIncrease({});
                  }}
                  className={`rounded border p-2 text-xs font-semibold transition-all ${
                    asiMode === "FEAT"
                      ? "border-amber-500 bg-amber-950/40 text-amber-200"
                      : "border-stone-800 bg-stone-900 text-stone-400"
                  }`}
                >
                  Choisir un Don
                </button>
              </div>

              {asiMode === "STATS" && (
                <div>
                  <div className="flex justify-between items-center text-[11px] mb-2 text-stone-400">
                    <span>Répartissez 2 points (+2 sur une stat ou +1 sur deux)</span>
                    <span
                      className={
                        totalStatsAssigned === 2
                          ? "text-emerald-400 font-bold"
                          : "text-amber-400 font-semibold"
                      }
                    >
                      {totalStatsAssigned} / 2 pts
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(abilityLabels) as Ability[]).map((ability) => {
                      const currentVal = abilityIncrease[ability] ?? 0;
                      // Reste de points disponibles hors stat actuelle
                      const remainingPool = 2 - (totalStatsAssigned - currentVal);

                      return (
                        <label
                          key={ability}
                          className="rounded border border-stone-800 bg-stone-900 p-1.5 text-center block"
                        >
                          <span className="text-[10px] text-stone-400 block truncate">
                            {abilityLabels[ability]}
                          </span>
                          <select
                            value={currentVal}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setAbilityIncrease({ ...abilityIncrease, [ability]: val });
                            }}
                            className="mt-1 w-full rounded bg-stone-950 p-1 text-xs text-center text-stone-100 outline-none"
                          >
                            <option value="0">+0</option>
                            {remainingPool >= 1 && <option value="1">+1</option>}
                            {remainingPool >= 2 && <option value="2">+2</option>}
                          </select>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {asiMode === "FEAT" && (
                <div className="relative" ref={featRef}>
                  <button
                    type="button"
                    onClick={() => setFeatOpen((v) => !v)}
                    className="flex w-full items-center justify-between rounded border border-stone-700 bg-stone-900 px-3 py-2 text-left text-xs"
                  >
                    <span
                      className={selectedFeatObj ? "font-semibold text-white" : "text-stone-400"}
                    >
                      {selectedFeatObj
                        ? selectedFeatObj.name
                        : feat || "Choisir un don dans la liste..."}
                    </span>
                    <span>▾</span>
                  </button>
                  {featOpen && (
                    <div className="absolute left-0 right-0 top-full z-40 mt-1 max-h-48 overflow-hidden rounded border border-stone-700 bg-stone-900 shadow-xl">
                      <input
                        autoFocus
                        type="text"
                        value={featSearch}
                        onChange={(e) => setFeatSearch(e.target.value)}
                        placeholder="Rechercher un don..."
                        className="w-full border-b border-stone-800 bg-stone-950 p-2 text-xs text-stone-100 outline-none"
                      />
                      <ul className="max-h-36 overflow-y-auto p-1 text-xs">
                        {filteredFeats.length === 0 ? (
                          <li className="p-2 text-center text-stone-500 italic">
                            Aucun don disponible
                          </li>
                        ) : (
                          filteredFeats.map((f) => (
                            <li key={f.id}>
                              <button
                                type="button"
                                onClick={() => {
                                  setFeat(f.name);
                                  setFeatOpen(false);
                                }}
                                className="w-full rounded px-2 py-1.5 text-left hover:bg-stone-800 text-stone-200"
                              >
                                <p className="font-semibold">{f.name}</p>
                                {f.description && (
                                  <p className="text-[10px] text-stone-400 truncate">
                                    {f.description}
                                  </p>
                                )}
                              </button>
                            </li>
                          ))
                        )}
                      </ul>
                    </div>
                  )}
                  {selectedFeatObj?.description && (
                    <p className="mt-2 text-[11px] text-stone-400 italic bg-stone-950/60 p-2 rounded border border-stone-800">
                      {selectedFeatObj.description}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Sélection de sorts (si lanceur de sorts) */}
          {spellSelectionCount > 0 && setSelectedSpellIds && (
            <div className="rounded-lg border border-stone-800 bg-stone-900/40 p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-300">
                  Apprentissage de Sorts
                </span>
                <span
                  className={`font-mono text-xs ${
                    selectedSpellIds.length === spellSelectionCount
                      ? "text-emerald-400"
                      : "text-amber-400"
                  }`}
                >
                  {selectedSpellIds.length} / {spellSelectionCount} choisi
                  {spellSelectionCount > 1 ? "s" : ""}
                </span>
              </div>
              {availableSpells.length === 0 ? (
                <p className="rounded border border-amber-500/30 bg-amber-950/20 px-3 py-2 text-xs text-amber-200">
                  Aucun sort n&apos;a pu être chargé depuis la base pour ce niveau. Vous pouvez
                  confirmer le passage de niveau sans choisir de sort.
                </p>
              ) : availableSpells.length < spellSelectionCount ? (
                <p className="rounded border border-amber-500/30 bg-amber-950/20 px-3 py-2 text-xs text-amber-200">
                  La base ne propose que {availableSpells.length} sort
                  {availableSpells.length > 1 ? "s" : ""} pour un quota attendu de{" "}
                  {spellSelectionCount}. La confirmation reste possible.
                </p>
              ) : (
                <>
                  <p className="text-[11px] text-stone-400 mb-2">
                    Sélectionnez vos nouveaux sorts (jusqu&apos;au niveau {maxSpellLevel}) :
                  </p>
                  <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                    {availableSpells.map((spell) => {
                      const isChecked = selectedSpellIds.includes(spell.id);
                      return (
                        <label
                          key={spell.id}
                          className={`flex items-center justify-between rounded p-2 text-xs border cursor-pointer ${
                            isChecked
                              ? "border-amber-500/60 bg-amber-950/20 text-white"
                              : "border-stone-800 bg-stone-900/60 text-stone-300"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setSelectedSpellIds(
                                    selectedSpellIds.filter((id) => id !== spell.id)
                                  );
                                } else if (selectedSpellIds.length < spellSelectionCount) {
                                  setSelectedSpellIds([...selectedSpellIds, spell.id]);
                                }
                              }}
                            />
                            <span className="font-semibold">{spell.name}</span>
                          </div>
                          <span className="font-mono text-[10px] text-stone-400">
                            Niv. {spell.level}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Pied de page fixe */}
        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-stone-800 p-4 bg-stone-950">
          <button
            type="button"
            onClick={onCancel}
            className="rounded border border-stone-700 px-3 py-1.5 text-xs text-stone-300 hover:bg-stone-900"
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={
              pending ||
              isSubclassBlocked ||
              isAsiBlocked ||
              isSpellBlocked ||
              isMulticlassBlocked
            }
            onClick={onConfirm}
            className="rounded px-4 py-1.5 text-xs font-bold text-white shadow-md disabled:cursor-not-allowed disabled:opacity-40"
            style={{ background: "var(--dnd-accent)" }}
          >
            {pending ? "Confirmation..." : "Appliquer le niveau"}
          </button>
        </div>
      </div>
    </div>
  );
}