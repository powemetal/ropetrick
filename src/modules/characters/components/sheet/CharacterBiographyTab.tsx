"use client";

import { type CharacterBiographyState } from "@/modules/characters/components/sheet/shared";

type CharacterBiographyTabProps = {
  biography: CharacterBiographyState;
  setBiography: (
    value: CharacterBiographyState | ((current: CharacterBiographyState) => CharacterBiographyState)
  ) => void;
  editing?: boolean;
};

export function CharacterBiographyTab({
  biography,
  setBiography,
  editing = true,
}: CharacterBiographyTabProps) {
  const inputStyle = {
    borderColor: "var(--dnd-accent-soft)",
    backgroundColor: "var(--dnd-surface)",
    color: "inherit",
  };

  return (
    <section
      className="mt-4 grid gap-4 rounded-lg border p-4 sm:grid-cols-2"
      style={{ borderColor: "var(--dnd-accent-soft)", background: "var(--dnd-surface)" }}
    >
      <label className="grid gap-1 text-sm font-semibold text-[var(--dnd-ink)]">
        Traits de personnalité
        <textarea
          value={biography.personalityTraits}
          disabled={!editing}
          onChange={(event) =>
            setBiography((current) => ({ ...current, personalityTraits: event.target.value }))
          }
          rows={3}
          placeholder="Non renseigné"
          className="rounded-lg border px-3 py-2 text-xs sm:text-sm font-normal outline-none transition-opacity disabled:opacity-75"
          style={inputStyle}
        />
      </label>

      <label className="grid gap-1 text-sm font-semibold text-[var(--dnd-ink)]">
        Idéaux
        <textarea
          value={biography.ideals}
          disabled={!editing}
          onChange={(event) =>
            setBiography((current) => ({ ...current, ideals: event.target.value }))
          }
          rows={3}
          placeholder="Non renseigné"
          className="rounded-lg border px-3 py-2 text-xs sm:text-sm font-normal outline-none transition-opacity disabled:opacity-75"
          style={inputStyle}
        />
      </label>

      <label className="grid gap-1 text-sm font-semibold text-[var(--dnd-ink)]">
        Liens
        <textarea
          value={biography.bonds}
          disabled={!editing}
          onChange={(event) =>
            setBiography((current) => ({ ...current, bonds: event.target.value }))
          }
          rows={3}
          placeholder="Non renseigné"
          className="rounded-lg border px-3 py-2 text-xs sm:text-sm font-normal outline-none transition-opacity disabled:opacity-75"
          style={inputStyle}
        />
      </label>

      <label className="grid gap-1 text-sm font-semibold text-[var(--dnd-ink)]">
        Défauts
        <textarea
          value={biography.flaws}
          disabled={!editing}
          onChange={(event) =>
            setBiography((current) => ({ ...current, flaws: event.target.value }))
          }
          rows={3}
          placeholder="Non renseigné"
          className="rounded-lg border px-3 py-2 text-xs sm:text-sm font-normal outline-none transition-opacity disabled:opacity-75"
          style={inputStyle}
        />
      </label>

      <label className="grid gap-1 text-sm font-semibold text-[var(--dnd-ink)] sm:col-span-2">
        Alliés et Organisations
        <textarea
          value={biography.alliesOrganizations}
          disabled={!editing}
          onChange={(event) =>
            setBiography((current) => ({ ...current, alliesOrganizations: event.target.value }))
          }
          rows={3}
          placeholder="Non renseigné"
          className="rounded-lg border px-3 py-2 text-xs sm:text-sm font-normal outline-none transition-opacity disabled:opacity-75"
          style={inputStyle}
        />
      </label>

      <label className="grid gap-1 text-sm font-semibold text-[var(--dnd-ink)] sm:col-span-2">
        Apparence
        <textarea
          value={biography.appearance}
          disabled={!editing}
          onChange={(event) =>
            setBiography((current) => ({ ...current, appearance: event.target.value }))
          }
          rows={3}
          placeholder="Non renseigné"
          className="rounded-lg border px-3 py-2 text-xs sm:text-sm font-normal outline-none transition-opacity disabled:opacity-75"
          style={inputStyle}
        />
      </label>

      <label className="grid gap-1 text-sm font-semibold text-[var(--dnd-ink)] sm:col-span-2">
        Historique / Biographie
        <textarea
          value={biography.backstory}
          disabled={!editing}
          onChange={(event) =>
            setBiography((current) => ({ ...current, backstory: event.target.value }))
          }
          rows={6}
          placeholder="Non renseigné"
          className="rounded-lg border px-3 py-2 text-xs sm:text-sm font-normal outline-none transition-opacity disabled:opacity-75"
          style={inputStyle}
        />
      </label>
    </section>
  );
}