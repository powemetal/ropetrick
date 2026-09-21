"use client";

import { useState } from "react";
import { type CharacterNewFeatState } from "@/modules/characters/components/sheet/shared";
import { SubtileFeatCard } from "./SubtileFeatCard";
import { FeatCreationBox } from "./FeatCreationBox";

type FeatOption = {
  id: string;
  name: string;
  category?: string;
  description?: string | null;
  prerequisite?: string | null;
};

type CharacterFeatsTabProps = {
  character: {
    id?: string;
    originFeat?: { name: string; category?: string; description?: string; isPinned?: boolean } | null;
    selectedFeats?: any;
    feats?: any;
    rawImportData?: any;
  };
  editing: boolean;
  activeFeats: any[];
  setDraftFeats: React.Dispatch<React.SetStateAction<any[]>>;
  newFeat: CharacterNewFeatState;
  setNewFeat: (value: CharacterNewFeatState | ((current: CharacterNewFeatState) => CharacterNewFeatState)) => void;
  classFeaturesAtLevel: { id: string; level: number; name: string; description: string; isPinned?: boolean; requirements?: string }[];
  availableFeats?: FeatOption[];
  onDeleteFeat?: (uniqueKey: string, featItem: any) => Promise<void> | void;
  onTogglePin?: (uniqueKey: string) => void;
};

export function CharacterFeatsTab({ character, editing, activeFeats, setDraftFeats, newFeat, setNewFeat, classFeaturesAtLevel, availableFeats = [], onDeleteFeat, onTogglePin }: CharacterFeatsTabProps) {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const [racialSearch, setRacialSearch] = useState("");
  const [originSearch, setOriginSearch] = useState("");
  const [acquiredSearch, setAcquiredSearch] = useState("");
  const [classSearch, setClassSearch] = useState("");

  const [deletedKeys, setDeletedKeys] = useState<Record<string, boolean>>({});

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleSection = (sectionKey: string) => {
    setCollapsedSections((prev) => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
  };

  const handleAddFeat = () => {
    if (!newFeat.name.trim()) return;

    const featToAdd = {
      id: `custom-feat-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: newFeat.name.trim(),
      category: newFeat.category ?? "GENERAL",
      description: newFeat.description.trim() || "Aucune description.",
      featureType: "feat",
      isPinned: false,
    };

    setDraftFeats((current) => [...current, featToAdd]);
    setNewFeat({ name: "", category: "GENERAL", description: "" });
  };

  const handleDeleteItem = (uniqueKey: string, featItem: any) => {
    setDeletedKeys((prev) => ({ ...prev, [uniqueKey]: true }));

    const lastHyphenIndex = uniqueKey.lastIndexOf("-");
    const targetIndex = lastHyphenIndex !== -1 ? parseInt(uniqueKey.substring(lastHyphenIndex + 1), 10) : -1;

    if (!uniqueKey.startsWith("class-trait") && targetIndex >= 0) {
      setDraftFeats((current) => current.filter((_, idx) => idx !== targetIndex));
    }

    if (onDeleteFeat) {
      onDeleteFeat(uniqueKey, featItem);
    }
  };

  const sourceFeats = Array.isArray(activeFeats) ? activeFeats : [];
  const classFeaturesSource = Array.isArray(classFeaturesAtLevel) ? classFeaturesAtLevel : [];

  // 1. Traits Raciaux (issus de sourceFeats)
  const racialTraits = sourceFeats
    .map((feat, globalIdx) => ({ feat, globalIdx }))
    .filter(({ feat }) => feat.featureType === "race")
    .filter(({ feat, globalIdx }) => !deletedKeys[`racial-${feat.id ?? globalIdx}-${globalIdx}`]);

  // 2. Dons Acquis (issus de sourceFeats)
  const standardImportedFeats = sourceFeats
    .map((feat, globalIdx) => ({ feat, globalIdx }))
    .filter(({ feat }) => !feat.featureType || feat.featureType === "feat")
    .filter(({ feat, globalIdx }) => !deletedKeys[`acquired-${feat.id ?? globalIdx}-${globalIdx}`]);

  // 3. Aptitudes de Classe (liées directement à la source propre classFeaturesAtLevel)
  const classTraitsFromImport = classFeaturesSource.map((feat, globalIdx) => ({ feat, globalIdx })).filter(({ feat, globalIdx }) => !deletedKeys[`class-trait-${feat.id ?? globalIdx}-${globalIdx}`]);

  const filteredRacialTraits = racialTraits.filter(({ feat }) => feat.name.toLowerCase().includes(racialSearch.toLowerCase()));

  const matchesOriginSearch = character.originFeat && !deletedKeys["origin-feat"] && (character.originFeat.name.toLowerCase().includes(originSearch.toLowerCase()) || (character.originFeat.description && character.originFeat.description.toLowerCase().includes(originSearch.toLowerCase())));

  const filteredAcquiredFeats = standardImportedFeats.filter(({ feat }) => feat.name.toLowerCase().includes(acquiredSearch.toLowerCase()) || (feat.description && feat.description.toLowerCase().includes(acquiredSearch.toLowerCase())));

  const filteredClassTraits = classTraitsFromImport.filter(({ feat }) => feat.name.toLowerCase().includes(classSearch.toLowerCase()) || (feat.description && feat.description.toLowerCase().includes(classSearch.toLowerCase())));

  return (
    <section className="mt-2 space-y-4">
      {editing && <FeatCreationBox newFeat={newFeat} setNewFeat={setNewFeat} availableFeats={availableFeats} onAddFeat={handleAddFeat} />}

      {racialTraits.length > 0 && filteredRacialTraits.length > 0 && (
        <div className="rounded-xl border p-4 shadow-sm" style={{ borderColor: "var(--dnd-accent)", background: "var(--dnd-surface)" }}>
          <div onClick={() => toggleSection("racial")} className="flex items-center justify-between cursor-pointer select-none mb-3">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <span>Traits Raciaux ({filteredRacialTraits.length})</span>
            </h3>
            <span className="text-xs font-bold opacity-70" style={{ color: "var(--dnd-accent)" }}>
              {collapsedSections["racial"] ? "[ + Afficher ]" : "[ - Masquer ]"}
            </span>
          </div>

          {!collapsedSections["racial"] && (
            <div className="space-y-2 pt-1">
              {racialTraits.length > 3 && <input type="text" placeholder="Filtrer les traits raciaux..." value={racialSearch} onChange={(e) => setRacialSearch(e.target.value)} className="w-full rounded-lg border px-2.5 py-1 text-xs outline-none mb-2" style={{ borderColor: "var(--dnd-accent-soft)", backgroundColor: "var(--dnd-surface)", color: "inherit" }} />}
              {filteredRacialTraits.map(({ feat: trait, globalIdx }: { feat: any; globalIdx: number }) => {
                const featId = trait.id ?? globalIdx;
                const uniqueKey = `racial-${featId}-${globalIdx}`;
                return (
                  <div key={uniqueKey} className="flex items-center gap-2">
                    <div className="flex-1">
                      <SubtileFeatCard itemKey={uniqueKey} title={trait.name} description={trait.description} isOpen={!!openItems[uniqueKey]} onToggle={toggleItem} onDelete={editing ? () => handleDeleteItem(uniqueKey, trait) : undefined} />
                    </div>
                    {editing && onTogglePin && (
                      <button type="button" onClick={() => onTogglePin(uniqueKey)} className={`px-3 py-2 text-xs font-bold rounded-lg border transition-all shrink-0 ${trait.isPinned ? "bg-amber-500 text-white border-amber-600" : "bg-transparent border-[var(--dnd-accent-soft)] hover:opacity-80"}`} title="Épingler comme don clé">
                        {trait.isPinned ? "★ Clé" : "☆ Épingler"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {character.originFeat && matchesOriginSearch && (
        <div className="rounded-xl border p-4 shadow-sm" style={{ borderColor: "var(--dnd-accent)", background: "var(--dnd-surface)" }}>
          <div onClick={() => toggleSection("origin")} className="flex items-center justify-between cursor-pointer select-none mb-3">
            <h3 className="font-extrabold text-xs uppercase tracking-wider">Don d&apos;origine</h3>
            <span className="text-xs font-bold opacity-70" style={{ color: "var(--dnd-accent)" }}>
              {collapsedSections["origin"] ? "[ + Afficher ]" : "[ - Masquer ]"}
            </span>
          </div>

          {!collapsedSections["origin"] && (
            <div className="space-y-2 pt-1">
              <input type="text" placeholder="Filtrer le don d'origine..." value={originSearch} onChange={(e) => setOriginSearch(e.target.value)} className="w-full rounded-lg border px-2.5 py-1 text-xs outline-none mb-2" style={{ borderColor: "var(--dnd-accent-soft)", backgroundColor: "var(--dnd-surface)", color: "inherit" }} />
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <SubtileFeatCard itemKey="origin-feat" title={character.originFeat.name} description={character.originFeat.description ?? "Aucune description."} isOpen={!!openItems["origin-feat"]} onToggle={toggleItem} onDelete={editing ? () => handleDeleteItem("origin-feat", character.originFeat) : undefined} />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {standardImportedFeats.length > 0 && filteredAcquiredFeats.length > 0 && (
        <div className="rounded-xl border p-4 shadow-sm" style={{ borderColor: "var(--dnd-accent)", background: "var(--dnd-surface)" }}>
          <div onClick={() => toggleSection("acquired")} className="flex items-center justify-between cursor-pointer select-none mb-3">
            <h3 className="font-extrabold text-xs uppercase tracking-wider">Dons acquis ({filteredAcquiredFeats.length})</h3>
            <span className="text-xs font-bold opacity-70" style={{ color: "var(--dnd-accent)" }}>
              {collapsedSections["acquired"] ? "[ + Afficher ]" : "[ - Masquer ]"}
            </span>
          </div>

          {!collapsedSections["acquired"] && (
            <div className="space-y-2 pt-1">
              {standardImportedFeats.length > 3 && <input type="text" placeholder="Filtrer les dons acquis..." value={acquiredSearch} onChange={(e) => setAcquiredSearch(e.target.value)} className="w-full rounded-lg border px-2.5 py-1 text-xs outline-none mb-2" style={{ borderColor: "var(--dnd-accent-soft)", backgroundColor: "var(--dnd-surface)", color: "inherit" }} />}
              {filteredAcquiredFeats.map(({ feat: featEntry, globalIdx }: { feat: any; globalIdx: number }) => {
                const featId = featEntry.id ?? globalIdx;
                const uniqueKey = `acquired-${featId}-${globalIdx}`;
                return (
                  <div key={uniqueKey} className="flex items-center gap-2">
                    <div className="flex-1">
                      <SubtileFeatCard itemKey={uniqueKey} title={featEntry.name} description={featEntry.description} isOpen={!!openItems[uniqueKey]} onToggle={toggleItem} onDelete={editing ? () => handleDeleteItem(uniqueKey, featEntry) : undefined} />
                    </div>
                    {editing && onTogglePin && (
                      <button type="button" onClick={() => onTogglePin(uniqueKey)} className={`px-3 py-2 text-xs font-bold rounded-lg border transition-all shrink-0 ${featEntry.isPinned ? "bg-amber-500 text-white border-amber-600" : "bg-transparent border-[var(--dnd-accent-soft)] hover:opacity-80"}`} title="Épingler comme don clé">
                        {featEntry.isPinned ? "★ Clé" : "☆ Épingler"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {classTraitsFromImport.length > 0 && filteredClassTraits.length > 0 && (
        <div className="rounded-xl border p-4 shadow-sm" style={{ borderColor: "var(--dnd-accent)", background: "var(--dnd-surface)" }}>
          <div onClick={() => toggleSection("class")} className="flex items-center justify-between cursor-pointer select-none mb-3">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-blue-600 dark:text-blue-400">Aptitudes de classe ({filteredClassTraits.length})</h3>
            <span className="text-xs font-bold opacity-70" style={{ color: "var(--dnd-accent)" }}>
              {collapsedSections["class"] ? "[ + Afficher ]" : "[ - Masquer ]"}
            </span>
          </div>

          {!collapsedSections["class"] && (
            <div className="space-y-2 pt-1">
              {classTraitsFromImport.length > 3 && <input type="text" placeholder="Filtrer les aptitudes de classe..." value={classSearch} onChange={(e) => setClassSearch(e.target.value)} className="w-full rounded-lg border px-2.5 py-1 text-xs outline-none mb-2" style={{ borderColor: "var(--dnd-accent-soft)", backgroundColor: "var(--dnd-surface)", color: "inherit" }} />}
              {filteredClassTraits.map(({ feat, globalIdx }: { feat: any; globalIdx: number }) => {
                const featId = feat.id ?? globalIdx;
                const uniqueKey = `class-trait-${featId}-${globalIdx}`;
                return (
                  <div key={uniqueKey} className="flex items-center gap-2">
                    <div className="flex-1">
                      <SubtileFeatCard itemKey={uniqueKey} title={feat.name} subtitle={feat.requirements ?? (feat.level ? `Niveau ${feat.level}` : "")} description={feat.description} isOpen={!!openItems[uniqueKey]} onToggle={toggleItem} onDelete={editing ? () => handleDeleteItem(uniqueKey, feat) : undefined} />
                    </div>
                    {editing && onTogglePin && (
                      <button type="button" onClick={() => onTogglePin(uniqueKey)} className={`px-3 py-2 text-xs font-bold rounded-lg border transition-all shrink-0 ${feat.isPinned ? "bg-amber-500 text-white border-amber-600" : "bg-transparent border-[var(--dnd-accent-soft)] hover:opacity-80"}`} title="Épingler comme aptitude clé">
                        {feat.isPinned ? "★ Clé" : "☆ Épingler"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
