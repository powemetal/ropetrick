"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { type CharacterNewFeatState } from "@/modules/characters/components/sheet/shared";

type FeatOption = {
  id: string;
  name: string;
  category?: string;
  description?: string | null;
  prerequisite?: string | null;
};

type FeatCreationBoxProps = {
  newFeat: CharacterNewFeatState;
  setNewFeat: (value: CharacterNewFeatState | ((current: CharacterNewFeatState) => CharacterNewFeatState)) => void;
  availableFeats: FeatOption[];
  onAddFeat: (featureType?: string) => void;
};

export function FeatCreationBox({ newFeat, setNewFeat, availableFeats, onAddFeat }: FeatCreationBoxProps) {
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customFeatureType, setCustomFeatureType] = useState<string>("feat");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("ALL");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredFeats = useMemo(() => {
    return availableFeats.filter((feat) => {
      const featCat = (feat.category ?? "GENERAL").trim().toUpperCase();
      const matchesCategory = selectedCategoryFilter === "ALL" || featCat === selectedCategoryFilter.toUpperCase();
      const query = searchTerm.trim().toLowerCase();
      const matchesSearch = !query || feat.name.toLowerCase().includes(query) || (feat.prerequisite && feat.prerequisite.toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    });
  }, [availableFeats, searchTerm, selectedCategoryFilter]);

  const handleSelectFeat = (feat: FeatOption) => {
    setNewFeat({
      name: feat.name,
      category: feat.category ?? "GENERAL",
      description: feat.description ?? "",
    });
    setSearchTerm(feat.name);
    setIsDropdownOpen(false);
  };

  const handleAddClick = () => {
    onAddFeat(isCustomMode ? customFeatureType : "feat");
    if (isCustomMode) {
      setCustomFeatureType("feat");
    }
  };

  return (
    <div className="rounded-xl border border-dashed p-5 mb-4 relative" style={{ borderColor: "var(--dnd-accent)", background: "var(--dnd-surface)" }}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold text-sm">
          {isCustomMode ? "Créer un élément personnalisé" : "Ajouter un don depuis le compendium"}
        </h4>
        <button
          type="button"
          onClick={() => {
            setIsCustomMode(!isCustomMode);
            setNewFeat({ name: "", category: "GENERAL", description: "" });
            setSearchTerm("");
          }}
          className="text-xs font-semibold underline hover:opacity-80"
          style={{ color: "var(--dnd-accent)" }}
        >
          {isCustomMode ? "← Revenir au compendium" : "+ Créer un élément custom"}
        </button>
      </div>
      
      {!isCustomMode ? (
        <div ref={dropdownRef}>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {[
              { label: "Tous", value: "ALL" },
              { label: "Origine", value: "ORIGIN" },
              { label: "Général", value: "GENERAL" },
              { label: "Style de combat", value: "FIGHTING_STYLE" },
              { label: "Bénédiction épique", value: "EPIC_BOON" },
            ].map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => {
                  setSelectedCategoryFilter(cat.value);
                  setIsDropdownOpen(true);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedCategoryFilter === cat.value ? "text-white shadow-sm" : "opacity-70 hover:opacity-100 border"
                }`}
                style={{
                  backgroundColor: selectedCategoryFilter === cat.value ? "var(--dnd-accent)" : "transparent",
                  borderColor: "var(--dnd-accent-soft)"
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 relative">
            <div className="relative sm:col-span-2">
              <input
                type="text"
                placeholder={selectedCategoryFilter === "ALL" ? "Rechercher par nom..." : `Rechercher un don de type ${selectedCategoryFilter.toLowerCase()}...`}
                value={searchTerm}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchTerm(val);
                  setIsDropdownOpen(true);
                  if (!val.trim()) {
                    setNewFeat((current) => ({ ...current, name: "", description: "" }));
                  } else {
                    setNewFeat((current) => ({ ...current, name: val }));
                  }
                }}
                onFocus={() => setIsDropdownOpen(true)}
                className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                style={{ borderColor: "var(--dnd-accent-soft)", backgroundColor: "var(--dnd-surface)", color: "inherit" }}
              />

              {isDropdownOpen && filteredFeats.length > 0 && (
                <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border shadow-lg" style={{ borderColor: "var(--dnd-accent-soft)", backgroundColor: "var(--dnd-surface)" }}>
                  {filteredFeats.map((feat) => (
                    <li
                      key={feat.id}
                      onClick={() => handleSelectFeat(feat)}
                      className="cursor-pointer px-3 py-2 text-xs sm:text-sm transition-colors hover:bg-black/10 dark:hover:bg-white/10 flex justify-between items-center"
                    >
                      <div>
                        <span className="font-medium">{feat.name}</span>
                        {feat.category && (
                          <span className="ml-2 text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--dnd-accent-soft)] opacity-80" style={{ color: "var(--dnd-accent)" }}>
                            {feat.category}
                          </span>
                        )}
                      </div>
                      {feat.prerequisite && (
                        <span className="text-[10px] opacity-60 italic ml-2">Prérequis : {feat.prerequisite}</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <textarea 
              placeholder="Description complète..." 
              value={newFeat.description} 
              onChange={(e) => setNewFeat({ ...newFeat, description: e.target.value })} 
              className="rounded-xl border px-3.5 py-2.5 text-sm sm:col-span-2 outline-none" 
              rows={4} 
              style={{ borderColor: "var(--dnd-accent-soft)", backgroundColor: "var(--dnd-surface)", color: "inherit" }} 
            />
          </div>
        </div>
      ) : (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <input
            type="text"
            placeholder="Nom du don / aptitude personnalisé(e)..."
            value={newFeat.name}
            onChange={(e) => setNewFeat({ ...newFeat, name: e.target.value })}
            className="w-full rounded-xl border px-3 py-2 text-sm outline-none sm:col-span-2"
            style={{ borderColor: "var(--dnd-accent-soft)", backgroundColor: "var(--dnd-surface)", color: "inherit" }}
          />

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold opacity-70">Type de destination :</label>
            <select 
              value={customFeatureType} 
              onChange={(e) => setCustomFeatureType(e.target.value)} 
              className="rounded-xl border px-3 py-2 text-sm outline-none" 
              style={{ borderColor: "var(--dnd-accent-soft)", backgroundColor: "var(--dnd-surface)", color: "inherit" }}
            >
              <option value="feat">Don acquis / Général</option>
              <option value="race">Trait racial</option>
              <option value="class">Aptitude de classe</option>
            </select>
          </div>

          {customFeatureType === "feat" && (
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold opacity-70">Catégorie de don :</label>
              <select 
                value={newFeat.category} 
                onChange={(e) => setNewFeat({ ...newFeat, category: e.target.value })} 
                className="rounded-xl border px-3 py-2 text-sm outline-none" 
                style={{ borderColor: "var(--dnd-accent-soft)", backgroundColor: "var(--dnd-surface)", color: "inherit" }}
              >
                <option value="GENERAL">Général</option>
                <option value="ORIGIN">Origine</option>
                <option value="FIGHTING_STYLE">Style de Combat</option>
                <option value="EPIC_BOON">Bénédiction Épique</option>
              </select>
            </div>
          )}

          <textarea 
            placeholder="Description complète de votre don ou aptitude..." 
            value={newFeat.description} 
            onChange={(e) => setNewFeat({ ...newFeat, description: e.target.value })} 
            className="rounded-xl border px-3.5 py-2.5 text-sm sm:col-span-2 outline-none" 
            rows={4} 
            style={{ borderColor: "var(--dnd-accent-soft)", backgroundColor: "var(--dnd-surface)", color: "inherit" }} 
          />
        </div>
      )}

      <button 
        type="button" 
        onClick={handleAddClick} 
        className="mt-3 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:opacity-90" 
        style={{ background: "var(--dnd-accent)" }}
      >
        + Ajouter l&apos;élément
      </button>
    </div>
  );
}