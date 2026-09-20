"use client";

import { type CharacterBiographyState } from "@/modules/characters/components/sheet/shared";

type CharacterBiographyTabProps = {
  biography: CharacterBiographyState;
  setBiography: (value: CharacterBiographyState | ((current: CharacterBiographyState) => CharacterBiographyState)) => void;
};

export function CharacterBiographyTab({ biography, setBiography }: CharacterBiographyTabProps) {
  return (
    <section className="mt-4 grid gap-3 rounded-lg border p-4 sm:grid-cols-2" style={{ borderColor: "var(--dnd-accent-soft)", background: "var(--dnd-surface)" }}>
      <label className="grid gap-1 text-sm">
        Traits de personnalité
        <textarea value={biography.personalityTraits} onChange={(event) => setBiography((current) => ({ ...current, personalityTraits: event.target.value }))} rows={2} placeholder="Non renseigné" className="rounded border bg-transparent px-2 py-1" />
      </label>
      <label className="grid gap-1 text-sm">
        Idéaux
        <textarea value={biography.ideals} onChange={(event) => setBiography((current) => ({ ...current, ideals: event.target.value }))} rows={2} placeholder="Non renseigné" className="rounded border bg-transparent px-2 py-1" />
      </label>
      <label className="grid gap-1 text-sm">
        Liens
        <textarea value={biography.bonds} onChange={(event) => setBiography((current) => ({ ...current, bonds: event.target.value }))} rows={2} placeholder="Non renseigné" className="rounded border bg-transparent px-2 py-1" />
      </label>
      <label className="grid gap-1 text-sm">
        Défauts
        <textarea value={biography.flaws} onChange={(event) => setBiography((current) => ({ ...current, flaws: event.target.value }))} rows={2} placeholder="Non renseigné" className="rounded border bg-transparent px-2 py-1" />
      </label>
      <label className="grid gap-1 text-sm sm:col-span-2">
        Apparence
        <textarea value={biography.appearance} onChange={(event) => setBiography((current) => ({ ...current, appearance: event.target.value }))} rows={3} placeholder="Non renseigné" className="rounded border bg-transparent px-2 py-1" />
      </label>
      <label className="grid gap-1 text-sm sm:col-span-2">
        Historique
        <textarea value={biography.backstory} onChange={(event) => setBiography((current) => ({ ...current, backstory: event.target.value }))} rows={5} placeholder="Non renseigné" className="rounded border bg-transparent px-2 py-1" />
      </label>
    </section>
  );
}
