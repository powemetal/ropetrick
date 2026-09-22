"use client";

import { proficiencyBonus } from "@/modules/characters/engine/dnd-rules-engine";
import { ThemeSelector } from "@/modules/characters/components/ThemeSelector";
import type { DndThemeKey } from "@/styles/dnd-themes";
import { CharacterSheetViewCharacter } from "@/modules/characters/components/sheet/shared";

type CharacterHeaderProps = {
  character: Pick<CharacterSheetViewCharacter, "name" | "className" | "level"> & {
    subclassName?: string | null;
  };
  editing: boolean;
  draftName: string;
  setDraftName: (value: string) => void;
  draftClass: string;
  setDraftClass: (value: string) => void;
  draftSubclass: string;
  setDraftSubclass: (value: string) => void;
  theme: DndThemeKey;
  setTheme: (value: DndThemeKey) => void;
  onOpenLevelModal?: () => void;
  onToggleEditing?: () => void;
};

export function CharacterHeader({
  character,
  editing,
  draftName,
  setDraftName,
  draftClass,
  setDraftClass,
  draftSubclass,
  setDraftSubclass,
  theme,
  setTheme,
  onOpenLevelModal,
  onToggleEditing,
}: CharacterHeaderProps) {
  const inputStyle = {
    borderColor: "var(--dnd-accent-soft)",
    backgroundColor: "var(--dnd-surface)",
    color: "inherit",
  };

  const displayedClass = editing ? draftClass : character.className;
  const displayedSubclass = editing ? draftSubclass : character.subclassName;

  return (
    <>
      <header
        className="flex flex-wrap items-start justify-between gap-5 border-b pb-5"
        style={{ borderColor: "var(--dnd-accent-soft)" }}
      >
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-[0.2em]"
            style={{ color: "var(--dnd-accent)" }}
          >
            Feuille d&apos;aventure · {editing ? "édition" : "mode jeu"}
          </p>

          {editing ? (
            <input
              type="text"
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              className="mt-2 rounded-lg border px-3 py-1 text-2xl sm:text-3xl font-bold outline-none"
              style={inputStyle}
              placeholder="Nom du personnage"
            />
          ) : (
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-[var(--dnd-ink)]">
              {character.name}
            </h2>
          )}

          <p className="mt-1 text-sm font-medium" style={{ color: "var(--dnd-muted)" }}>
            {displayedClass || "Classe non définie"}
            {displayedSubclass ? ` (${displayedSubclass})` : ""} · Niveau {character.level} · Bonus
            de maîtrise +{proficiencyBonus(character.level)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ThemeSelector value={theme} onChange={setTheme} />

          {onOpenLevelModal && (
            <button
              type="button"
              onClick={onOpenLevelModal}
              className="rounded-lg border px-3 py-2 text-sm font-semibold transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-95"
              style={{ borderColor: "var(--dnd-accent)", color: "var(--dnd-ink)" }}
            >
              Niveau supérieur
            </button>
          )}

          {onToggleEditing && (
            <button
              type="button"
              onClick={onToggleEditing}
              className="rounded-lg px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 active:scale-95"
              style={{ background: "var(--dnd-accent)" }}
            >
              {editing ? "Fermer l'édition" : "Modifier la fiche"}
            </button>
          )}
        </div>
      </header>

      {editing && (
        <div
          className="mt-4 grid gap-3 rounded-lg border p-4 sm:grid-cols-2"
          style={{ borderColor: "var(--dnd-accent-soft)", background: "var(--dnd-surface)" }}
        >
          <label className="grid gap-1 text-xs font-semibold uppercase tracking-wider text-[var(--dnd-ink)]">
            Classe principale
            <input
              type="text"
              value={draftClass}
              onChange={(event) => setDraftClass(event.target.value)}
              className="rounded-lg border px-3 py-1.5 text-sm font-normal outline-none"
              style={inputStyle}
              placeholder="Ex: Guerrier, Magicien..."
            />
          </label>

          <label className="grid gap-1 text-xs font-semibold uppercase tracking-wider text-[var(--dnd-ink)]">
            Sous-classe / Archétype
            <input
              type="text"
              value={draftSubclass}
              onChange={(event) => setDraftSubclass(event.target.value)}
              className="rounded-lg border px-3 py-1.5 text-sm font-normal outline-none"
              style={inputStyle}
              placeholder="Ex: Champion, Évocateur..."
            />
          </label>
        </div>
      )}
    </>
  );
}