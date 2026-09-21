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
    originFeat?: { name: string; category?: string; description?: string } | null;
    selectedFeats?: any;
    feats?: any;
    rawImportData?: any;
  };
  editing: boolean;
  activeFeats: any[];
  setDraftFeats: React.Dispatch<React.SetStateAction<any[]>>;
  newFeat: CharacterNewFeatState;
  setNewFeat: (value: CharacterNewFeatState | ((current: CharacterNewFeatState) => CharacterNewFeatState)) => void;
  classFeaturesAtLevel: { id: string; level: number; name: string; description: string }[];
  availableFeats?: FeatOption[];
  onDeleteFeat?: (uniqueKey: string, featItem: any) => Promise<void> | void;
};

export function CharacterFeatsTab({ 
  character, 
  editing, 
  activeFeats, 
  setDraftFeats, 
  newFeat, 
  setNewFeat, 
  classFeaturesAtLevel, 
  availableFeats = [],
  onDeleteFeat 
}: CharacterFeatsTabProps) {
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
      id: `custom-feat-${Date.now()}`,
      name: newFeat.name.trim(),
      category: newFeat.category ?? "GENERAL",
      description: newFeat.description.trim() || "Aucune description.",
      featureType: "feat",
    };

    setDraftFeats((current) => [...current, featToAdd]);
    setNewFeat({ name: "", category: "GENERAL", description: "" });
  };

  const handleDeleteItem = (uniqueKey: string, featItem: any) => {
    setDeletedKeys((prev) => ({ ...prev, [uniqueKey]: true }));

    // Filtrage propre basé sur l'ID ou le nom exact pour éviter les suppressions en cascade
    setDraftFeats((current) => current.filter((feat) => {
      const featId = feat.id ?? feat.name;
      return !uniqueKey.includes(String(featId));
    }));

    if (onDeleteFeat) {
      onDeleteFeat(uniqueKey, featItem);
    }
  };

  // Source unique et propre : activeFeats (qui contient déjà l'état initial fusionné)
  const sourceFeats = Array.isArray(activeFeats) ? activeFeats : [];

  const racialTraits = sourceFeats
    .filter((f: any) => f.featureType === "race")
    .filter((f: any) => {
      const key = `racial-${f.id ?? f.name}`;
      return !deletedKeys[key];
    });

  const classTraitsFromImport = sourceFeats
    .filter((f: any) => f.featureType === "class")
    .filter((f: any) => {
      const key = `class-trait-${f.id ?? f.name}`;
      return !deletedKeys[key];
    });

  const standardImportedFeats = sourceFeats
    .filter((f: any) => !f.featureType || f.featureType === "feat")
    .filter((f: any) => {
      const key = `acquired-${f.id ?? f.name}`;
      return !deletedKeys[key];
    });

  const filteredRacialTraits = racialTraits.filter((t: any) => t.name.toLowerCase().includes(racialSearch.toLowerCase()));
  
  const matchesOriginSearch = character.originFeat && !deletedKeys["origin-feat"] && (
    character.originFeat.name.toLowerCase().includes(originSearch.toLowerCase()) || 
    (character.originFeat.description && character.originFeat.description.toLowerCase().includes(originSearch.toLowerCase()))
  );

  const filteredAcquiredFeats = standardImportedFeats.filter((f: any) => 
    f.name.toLowerCase().includes(acquiredSearch.toLowerCase()) || 
    (f.description && f.description.toLowerCase().includes(acquiredSearch.toLowerCase()))
  );

  const filteredClassTraits = classTraitsFromImport.filter((c: any) => 
    c.name.toLowerCase().includes(classSearch.toLowerCase()) || 
    (c.description && c.description.toLowerCase().includes(classSearch.toLowerCase()))
  );

  return (
    <section className="mt-2 space-y-4">
      {editing && (
        <FeatCreationBox 
          newFeat={newFeat}
          setNewFeat={setNewFeat}
          availableFeats={availableFeats}
          onAddFeat={handleAddFeat}
        />
      )}

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
              {racialTraits.length > 3 && (
                <input
                  type="text"
                  placeholder="Filtrer les traits raciaux..."
                  value={racialSearch}
                  onChange={(e) => setRacialSearch(e.target.value)}
                  className="w-full rounded-lg border px-2.5 py-1 text-xs outline-none mb-2"
                  style={{ borderColor: "var(--dnd-accent-soft)", backgroundColor: "var(--dnd-surface)", color: "inherit" }}
                />
              )}
              {filteredRacialTraits.map((trait: any) => {
                const uniqueKey = `racial-${trait.id ?? trait.name}`;
                return (
                  <SubtileFeatCard 
                    key={uniqueKey} 
                    itemKey={uniqueKey} 
                    title={trait.name} 
                    description={trait.description} 
                    isOpen={!!openItems[uniqueKey]} 
                    onToggle={toggleItem} 
                    onDelete={editing ? () => handleDeleteItem(uniqueKey, trait) : undefined}
                  />
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
              <input
                type="text"
                placeholder="Filtrer le don d'origine..."
                value={originSearch}
                onChange={(e) => setOriginSearch(e.target.value)}
                className="w-full rounded-lg border px-2.5 py-1 text-xs outline-none mb-2"
                style={{ borderColor: "var(--dnd-accent-soft)", backgroundColor: "var(--dnd-surface)", color: "inherit" }}
              />
              <SubtileFeatCard 
                itemKey="origin-feat" 
                title={character.originFeat.name} 
                description={character.originFeat.description ?? "Aucune description."} 
                isOpen={!!openItems["origin-feat"]} 
                onToggle={toggleItem} 
                onDelete={editing ? () => handleDeleteItem("origin-feat", character.originFeat) : undefined}
              />
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
              {standardImportedFeats.length > 3 && (
                <input
                  type="text"
                  placeholder="Filtrer les dons acquis..."
                  value={acquiredSearch}
                  onChange={(e) => setAcquiredSearch(e.target.value)}
                  className="w-full rounded-lg border px-2.5 py-1 text-xs outline-none mb-2"
                  style={{ borderColor: "var(--dnd-accent-soft)", backgroundColor: "var(--dnd-surface)", color: "inherit" }}
                />
              )}
              {filteredAcquiredFeats.map((featEntry) => {
                const uniqueKey = `acquired-${featEntry.id ?? featEntry.name}`;
                return (
                  <SubtileFeatCard 
                    key={uniqueKey} 
                    itemKey={uniqueKey} 
                    title={featEntry.name} 
                    description={featEntry.description} 
                    isOpen={!!openItems[uniqueKey]} 
                    onToggle={toggleItem} 
                    onDelete={editing ? () => handleDeleteItem(uniqueKey, featEntry) : undefined}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {classTraitsFromImport.length > 0 && filteredClassTraits.length > 0 && (
        <div className="rounded-xl border p-4 shadow-sm" style={{ borderColor: "var(--dnd-accent)", background: "var(--dnd-surface)" }}>
          <div onClick={() => toggleSection("class")} className="flex items-center justify-between cursor-pointer select-none mb-3">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Aptitudes de classe ({filteredClassTraits.length})
            </h3>
            <span className="text-xs font-bold opacity-70" style={{ color: "var(--dnd-accent)" }}>
              {collapsedSections["class"] ? "[ + Afficher ]" : "[ - Masquer ]"}
            </span>
          </div>

          {!collapsedSections["class"] && (
            <div className="space-y-2 pt-1">
              {classTraitsFromImport.length > 3 && (
                <input
                  type="text"
                  placeholder="Filtrer les aptitudes de classe..."
                  value={classSearch}
                  onChange={(e) => setClassSearch(e.target.value)}
                  className="w-full rounded-lg border px-2.5 py-1 text-xs outline-none mb-2"
                  style={{ borderColor: "var(--dnd-accent-soft)", backgroundColor: "var(--dnd-surface)", color: "inherit" }}
                />
              )}
              {filteredClassTraits.map((feat: any) => {
                const uniqueKey = `class-trait-${feat.id ?? feat.name}`;
                return (
                  <SubtileFeatCard 
                    key={uniqueKey} 
                    itemKey={uniqueKey} 
                    title={feat.name} 
                    subtitle={feat.requirements} 
                    description={feat.description} 
                    isOpen={!!openItems[uniqueKey]} 
                    onToggle={toggleItem} 
                    onDelete={editing ? () => handleDeleteItem(uniqueKey, feat) : undefined}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
}