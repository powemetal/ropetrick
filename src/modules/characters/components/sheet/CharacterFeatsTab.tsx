"use client";

import { type CharacterFeatEntry, type CharacterSheetViewCharacter, type CharacterNewFeatState } from "@/modules/characters/components/sheet/shared";

type CharacterFeatsTabProps = {
  character: Pick<CharacterSheetViewCharacter, "originFeat">;
  editing: boolean;
  activeFeats: CharacterFeatEntry[];
  setDraftFeats: (value: CharacterFeatEntry[] | ((current: CharacterFeatEntry[]) => CharacterFeatEntry[])) => void;
  newFeat: CharacterNewFeatState;
  setNewFeat: (value: CharacterNewFeatState | ((current: CharacterNewFeatState) => CharacterNewFeatState)) => void;
  classFeaturesAtLevel: { id: string; level: number; name: string; description: string }[];
};

export function CharacterFeatsTab({ character, editing, activeFeats, setDraftFeats, newFeat, setNewFeat, classFeaturesAtLevel }: CharacterFeatsTabProps) {
  const handleAddFeat = () => {
    if (!newFeat.name.trim()) return;
    const featToAdd: CharacterFeatEntry = {
      id: `temp-feat-${Date.now()}`,
      name: newFeat.name.trim(),
      category: newFeat.category,
      description: newFeat.description.trim() || "Aucune description.",
    };
    setDraftFeats((current) => [...current, featToAdd]);
    setNewFeat({ name: "", category: "GENERAL", description: "" });
  };

  const handleRemoveFeat = (id: string) => {
    setDraftFeats((current) => current.filter((feat) => feat.id !== id));
  };

  return (
    <section className="mt-4 grid gap-4" style={{ borderColor: "var(--dnd-accent-soft)" }}>
      {editing && (
        <div className="rounded-lg border border-dashed p-4" style={{ borderColor: "var(--dnd-accent)" }}>
          <h4 className="font-semibold text-sm">Ajouter un don</h4>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <input placeholder="Nom du don" value={newFeat.name} onChange={(e) => setNewFeat({ ...newFeat, name: e.target.value })} className="rounded border bg-transparent px-2 py-1 text-sm" />
            <select value={newFeat.category} onChange={(e) => setNewFeat({ ...newFeat, category: e.target.value })} className="rounded border bg-transparent px-2 py-1 text-sm">
              <option value="GENERAL">Général</option>
              <option value="ORIGIN">Origine</option>
              <option value="FIGHTING_STYLE">Style de Combat</option>
              <option value="EPIC_BOON">Bénédiction Épique</option>
            </select>
            <textarea placeholder="Description complète du don..." value={newFeat.description} onChange={(e) => setNewFeat({ ...newFeat, description: e.target.value })} className="rounded border bg-transparent px-2 py-1 text-sm sm:col-span-2" rows={2} />
          </div>
          <button type="button" onClick={handleAddFeat} className="mt-3 rounded px-3 py-1.5 text-xs font-semibold text-white" style={{ background: "var(--dnd-accent)" }}>
            + Ajouter le don
          </button>
        </div>
      )}

      <div className="rounded-lg border p-4" style={{ borderColor: "var(--dnd-accent-soft)", background: "var(--dnd-surface)" }}>
        <h3 className="font-semibold">Don d&apos;origine</h3>
        {character.originFeat ? (
          <article className="mt-2">
            <strong>
              {character.originFeat.name}{" "}
              <span className="text-xs" style={{ color: "var(--dnd-muted)" }}>
                · {character.originFeat.category}
              </span>
            </strong>
            <p className="mt-1 text-sm" style={{ color: "var(--dnd-muted)" }}>
              {character.originFeat.description}
            </p>
          </article>
        ) : (
          <p className="mt-2 text-sm" style={{ color: "var(--dnd-muted)" }}>
            Aucun don d&apos;origine enregistré.
          </p>
        )}
      </div>

      <div className="rounded-lg border p-4" style={{ borderColor: "var(--dnd-accent-soft)", background: "var(--dnd-surface)" }}>
        <h3 className="font-semibold">Dons acquis</h3>
        {activeFeats.length ? (
          activeFeats.map((featEntry) => (
            <article key={featEntry.id} className="relative mt-2 border-b pb-2 last:border-0">
              {editing && (
                <button type="button" onClick={() => handleRemoveFeat(featEntry.id)} className="absolute right-0 top-0 text-xs text-red-600 hover:underline">
                  Supprimer
                </button>
              )}
              <strong>
                {featEntry.name}{" "}
                <span className="text-xs" style={{ color: "var(--dnd-muted)" }}>
                  · {featEntry.category}
                </span>
              </strong>
              <p className="mt-1 text-sm" style={{ color: "var(--dnd-muted)" }}>
                {featEntry.description}
              </p>
            </article>
          ))
        ) : (
          <p className="mt-2 text-sm" style={{ color: "var(--dnd-muted)" }}>
            Aucun don supplémentaire.
          </p>
        )}
      </div>

      <div className="rounded-lg border p-4" style={{ borderColor: "var(--dnd-accent-soft)", background: "var(--dnd-surface)" }}>
        <h3 className="font-semibold">Aptitudes de classe</h3>
        {classFeaturesAtLevel.length ? (
          classFeaturesAtLevel.map((feature) => (
            <article key={feature.id} className="mt-2">
              <strong>
                Niv. {feature.level} · {feature.name}
              </strong>
              <p className="mt-1 text-sm" style={{ color: "var(--dnd-muted)" }}>
                {feature.description}
              </p>
            </article>
          ))
        ) : (
          <p className="mt-2 text-sm" style={{ color: "var(--dnd-muted)" }}>
            Aucune aptitude référencée pour cette classe.
          </p>
        )}
      </div>
    </section>
  );
}
