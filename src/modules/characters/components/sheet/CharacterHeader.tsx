"use client";

import { 
  proficiencyBonus, 
  calculateMovementSpeed, 
  calculatePassivePerception, 
  calculatePassiveInsight, 
  calculatePassiveInvestigation, 
  calculateSkillBonuses 
} from "@/modules/characters/engine/dnd-rules-engine";
import { ThemeSelector } from "@/modules/characters/components/ThemeSelector";
import type { DndThemeKey } from "@/styles/dnd-themes";
import { CharacterSheetViewCharacter } from "@/modules/characters/components/sheet/shared";

type CharacterHeaderProps = {
  character: CharacterSheetViewCharacter & {
    subclassName?: string | null;
    experiencePoints?: number | null;
    speed?: number | null;
    strength?: number | null;
    dexterity?: number | null;
    constitution?: number | null;
    intelligence?: number | null;
    wisdom?: number | null;
    charisma?: number | null;
    skillProficiencies?: any;
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

  // Conversion explicite en number pour satisfaire le moteur de règles
  const scores = {
    strength: Number(character.strength ?? 10),
    dexterity: Number(character.dexterity ?? 10),
    constitution: Number(character.constitution ?? 10),
    intelligence: Number(character.intelligence ?? 10),
    wisdom: Number(character.wisdom ?? 10),
    charisma: Number(character.charisma ?? 10),
  };

  const skillBonuses = calculateSkillBonuses(scores, character.skillProficiencies || {}, character.level);
  const passivePerception = calculatePassivePerception(skillBonuses);
  const passiveInsight = calculatePassiveInsight(skillBonuses);
  const passiveInvestigation = calculatePassiveInvestigation(skillBonuses);
  const movement = calculateMovementSpeed({ baseSpeciesSpeed: Number(character.speed ?? 30) });

  const currentXp = Number(character.experiencePoints ?? 0);

  return (
    <>
      <header
        className="flex flex-wrap items-start justify-between gap-5 border-b pb-5"
        style={{ borderColor: "var(--dnd-accent-soft)" }}
      >
        <div className="flex-1 min-w-[280px]">
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
              className="mt-2 rounded-lg border px-3 py-1 text-2xl sm:text-3xl font-bold outline-none w-full"
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

          <div 
            className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-lg border p-3 text-xs"
            style={{ borderColor: "var(--dnd-accent-soft)", backgroundColor: "var(--dnd-surface)" }}
          >
            <div>
              <span className="block text-[var(--dnd-muted)] uppercase tracking-wider font-semibold">Vitesse</span>
              <span className="font-bold text-sm">{movement.walking} ft</span>
            </div>
            <div>
              <span className="block text-[var(--dnd-muted)] uppercase tracking-wider font-semibold">Passif Perception</span>
              <span className="font-bold text-sm">{passivePerception}</span>
            </div>
            <div>
              <span className="block text-[var(--dnd-muted)] uppercase tracking-wider font-semibold">Passif Perspicacité</span>
              <span className="font-bold text-sm">{passiveInsight}</span>
            </div>
            <div>
              <span className="block text-[var(--dnd-muted)] uppercase tracking-wider font-semibold">Passif Investigation</span>
              <span className="font-bold text-sm">{passiveInvestigation}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3">
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

          <div 
            className="w-full sm:w-64 rounded-lg border p-2.5 text-xs"
            style={{ borderColor: "var(--dnd-accent-soft)", backgroundColor: "var(--dnd-surface)" }}
          >
            <div className="flex justify-between font-semibold mb-1">
              <span className="text-[var(--dnd-muted)] uppercase tracking-wider">Expérience (XP)</span>
              <span>{currentXp.toLocaleString()} XP</span>
            </div>
            <div className="w-full bg-black/10 dark:bg-white/10 h-2 rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-300"
                style={{ width: `${Math.min(100, (currentXp / 355000) * 100)}%`, background: "var(--dnd-accent)" }}
              />
            </div>
          </div>
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