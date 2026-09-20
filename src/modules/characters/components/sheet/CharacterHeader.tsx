"use client";

import { proficiencyBonus } from "@/modules/characters/engine/dnd-rules-engine";
import { ThemeSelector } from "@/modules/characters/components/ThemeSelector";
import type { DndThemeKey } from "@/styles/dnd-themes";
import { CharacterSheetViewCharacter } from "@/modules/characters/components/sheet/shared";

type CharacterHeaderProps = {
  character: Pick<CharacterSheetViewCharacter, "name" | "className" | "level">;
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

export function CharacterHeader({ character, editing, draftName, setDraftName, draftClass, setDraftClass, draftSubclass, setDraftSubclass, theme, setTheme, onOpenLevelModal, onToggleEditing }: CharacterHeaderProps) {
  return (
    <>
      <header className="flex flex-wrap items-start justify-between gap-5 border-b pb-5" style={{ borderColor: "var(--dnd-accent-soft)" }}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--dnd-accent)" }}>
            Feuille d&apos;aventure · {editing ? "édition" : "mode jeu"}
          </p>
          {editing ? <input value={draftName} onChange={(event) => setDraftName(event.target.value)} className="mt-2 rounded border bg-transparent px-2 py-1 text-3xl font-semibold" /> : <h2 className="mt-2 text-3xl font-semibold">{character.name}</h2>}
          <p className="mt-1 text-sm" style={{ color: "var(--dnd-muted)" }}>
            {editing ? draftClass || "Classe non définie" : (character.className ?? "Classe non définie")} · Niveau {character.level} · Bonus de maîtrise +{proficiencyBonus(character.level)}
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <ThemeSelector value={theme} onChange={setTheme} />
          {onOpenLevelModal && (
            <button type="button" onClick={onOpenLevelModal} className="rounded-md border px-3 py-2 text-sm font-semibold" style={{ borderColor: "var(--dnd-accent)" }}>
              Niveau supérieur
            </button>
          )}
          {onToggleEditing && (
            <button type="button" onClick={onToggleEditing} className="rounded-md px-3 py-2 text-sm font-semibold text-white" style={{ background: "var(--dnd-accent)" }}>
              {editing ? "Fermer l'édition" : "Modifier la fiche"}
            </button>
          )}
        </div>
      </header>

      {editing && (
        <div className="mt-4 grid gap-3 rounded-lg border p-4 sm:grid-cols-2" style={{ borderColor: "var(--dnd-accent-soft)", background: "var(--dnd-surface)" }}>
          <label className="grid gap-1 text-sm">
            Classe
            <input value={draftClass} onChange={(event) => setDraftClass(event.target.value)} className="rounded border bg-transparent px-2 py-1" />
          </label>
          <label className="grid gap-1 text-sm">
            Sous-classe
            <input value={draftSubclass} onChange={(event) => setDraftSubclass(event.target.value)} className="rounded border bg-transparent px-2 py-1" />
          </label>
        </div>
      )}
    </>
  );
}
