"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { type CharacterNewFeatState } from "@/modules/characters/components/sheet/shared";

type FeatOption = {
  id: string;
  name: string;
  category?: string;
  description?: string | null;
  prerequisite?: string | null;
};

type CharacterFeatsTabProps = {
  character: {
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
};

type CollapsibleItemProps = {
  itemKey: string;
  title: string;
  subtitle?: string;
  description: string;
  isOpen: boolean;
  onToggle: (key: string) => void;
};

function SubtileFeatCard({ 
  itemKey, 
  title, 
  subtitle, 
  description, 
  isOpen,
  onToggle
}: CollapsibleItemProps) {
  return (
    <div className="rounded-lg border transition-all duration-200 mb-2 overflow-hidden bg-transparent" style={{ borderColor: "var(--dnd-accent-soft)", opacity: 0.95 }}>
      <div 
        onClick={() => onToggle(itemKey)}
        className="flex items-center justify-between px-3 py-2 cursor-pointer select-none transition-colors hover:bg-black/5 dark:hover:bg-white/5"
      >
        <div className="flex items-center gap-2 truncate">
          <svg 
            className="w-3.5 h-3.5 transition-transform duration-300 shrink-0 opacity-70" 
            style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', color: 'var(--dnd-accent)' }}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
          <span className="font-semibold text-xs sm:text-sm tracking-tight">{title}</span>
          {subtitle && <span className="text-[11px] opacity-60 font-medium">({subtitle})</span>}
        </div>
      </div>

      {isOpen && (
        <div className="px-3 pb-3 pt-1 border-t text-xs sm:text-sm transition-all duration-300" style={{ borderColor: "var(--dnd-accent-soft)" }}>
          <div className="mt-1.5 whitespace-pre-line leading-relaxed opacity-85" style={{ color: "var(--dnd-muted)" }} dangerouslySetInnerHTML={{ __html: description }} />
        </div>
      )}
    </div>
  );
}

export function CharacterFeatsTab({ character, editing, activeFeats, setDraftFeats, newFeat, setNewFeat, classFeaturesAtLevel, availableFeats = [] }: CharacterFeatsTabProps) {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("ALL");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Référence pour détecter les clics à l'extérieur de la combobox
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customFeatureType, setCustomFeatureType] = useState<string>("feat");

  const [racialSearch, setRacialSearch] = useState("");
  const [originSearch, setOriginSearch] = useState("");
  const [acquiredSearch, setAcquiredSearch] = useState("");
  const [classSearch, setClassSearch] = useState("");

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleSection = (sectionKey: string) => {
    setCollapsedSections((prev) => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
  };

  const filteredFeats = useMemo(() => {
    return availableFeats.filter((feat) => {
      const featCat = (feat.category ?? "GENERAL").trim().toUpperCase();
      const matchesCategory = selectedCategoryFilter === "ALL" || featCat === selectedCategoryFilter.toUpperCase();
      
      const query = searchTerm.trim().toLowerCase();
      const matchesSearch = !query || 
        feat.name.toLowerCase().includes(query) || 
        (feat.prerequisite && feat.prerequisite.toLowerCase().includes(query));
      
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

  const handleAddFeat = () => {
    if (!newFeat.name.trim()) return;
    
    const featToAdd = {
      id: `custom-feat-${Date.now()}`,
      name: newFeat.name.trim(),
      category: isCustomMode ? newFeat.category : (selectedCategoryFilter === "ALL" ? "GENERAL" : selectedCategoryFilter),
      description: newFeat.description.trim() || "Aucune description.",
      featureType: isCustomMode ? customFeatureType : "feat",
    };

    setDraftFeats((current) => [...current, featToAdd]);
    setNewFeat({ name: "", category: "GENERAL", description: "" });
    setSearchTerm("");
    setIsCustomMode(false);
  };

  const rawImportedFeats = Array.isArray(character.feats) 
    ? character.feats 
    : (Array.isArray(character.selectedFeats) ? character.selectedFeats : []);

  const racialTraits = rawImportedFeats.filter((f: any) => f.featureType === "race");
  const classTraitsFromImport = rawImportedFeats.filter((f: any) => f.featureType === "class");
  const standardImportedFeats = rawImportedFeats.filter((f: any) => f.featureType === "feat");

  const allAcquiredFeats = [
    ...standardImportedFeats.map((f: any, idx: number) => ({ id: f.id ?? `imp-${idx}`, ...f })),
    ...activeFeats,
  ];

  const filteredRacialTraits = racialTraits.filter((t: any) => t.name.toLowerCase().includes(racialSearch.toLowerCase()));
  
  const matchesOriginSearch = !character.originFeat || 
    character.originFeat.name.toLowerCase().includes(originSearch.toLowerCase()) || 
    (character.originFeat.description && character.originFeat.description.toLowerCase().includes(originSearch.toLowerCase()));

  const filteredAcquiredFeats = allAcquiredFeats.filter((f: any) => 
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
              {/* Filtres de catégories synchronisés */}
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
            /* Mode Custom : Permet de nommer, décrire et assigner le type d'élément */
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

          <button type="button" onClick={handleAddFeat} className="mt-3 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:opacity-90" style={{ background: "var(--dnd-accent)" }}>
            + Ajouter l&apos;élément
          </button>
        </div>
      )}

      {/* Sections d'affichage existantes */}
      {racialTraits.length > 0 && (
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
              {filteredRacialTraits.map((trait: any, idx: number) => {
                const uniqueKey = `racial-${trait.id ?? idx}`;
                return <SubtileFeatCard key={uniqueKey} itemKey={uniqueKey} title={trait.name} description={trait.description} isOpen={!!openItems[uniqueKey]} onToggle={toggleItem} />;
              })}
            </div>
          )}
        </div>
      )}

      {character.originFeat && (
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
              {matchesOriginSearch && (
                <SubtileFeatCard itemKey="origin-feat" title={character.originFeat.name} description={character.originFeat.description ?? "Aucune description."} isOpen={!!openItems["origin-feat"]} onToggle={toggleItem} />
              )}
            </div>
          )}
        </div>
      )}

      {allAcquiredFeats.length > 0 && (
        <div className="rounded-xl border p-4 shadow-sm" style={{ borderColor: "var(--dnd-accent)", background: "var(--dnd-surface)" }}>
          <div onClick={() => toggleSection("acquired")} className="flex items-center justify-between cursor-pointer select-none mb-3">
            <h3 className="font-extrabold text-xs uppercase tracking-wider">Dons acquis ({filteredAcquiredFeats.length})</h3>
            <span className="text-xs font-bold opacity-70" style={{ color: "var(--dnd-accent)" }}>
              {collapsedSections["acquired"] ? "[ + Afficher ]" : "[ - Masquer ]"}
            </span>
          </div>

          {!collapsedSections["acquired"] && (
            <div className="space-y-2 pt-1">
              {allAcquiredFeats.length > 3 && (
                <input
                  type="text"
                  placeholder="Filtrer les dons acquis..."
                  value={acquiredSearch}
                  onChange={(e) => setAcquiredSearch(e.target.value)}
                  className="w-full rounded-lg border px-2.5 py-1 text-xs outline-none mb-2"
                  style={{ borderColor: "var(--dnd-accent-soft)", backgroundColor: "var(--dnd-surface)", color: "inherit" }}
                />
              )}
              {filteredAcquiredFeats.map((featEntry, idx) => {
                const uniqueKey = `acquired-${featEntry.id ?? idx}`;
                return <SubtileFeatCard key={uniqueKey} itemKey={uniqueKey} title={featEntry.name} description={featEntry.description} isOpen={!!openItems[uniqueKey]} onToggle={toggleItem} />;
              })}
            </div>
          )}
        </div>
      )}

      {classTraitsFromImport.length > 0 && (
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
              {filteredClassTraits.map((feat: any, idx: number) => {
                const uniqueKey = `class-trait-${feat.id ?? idx}`;
                return <SubtileFeatCard key={uniqueKey} itemKey={uniqueKey} title={feat.name} subtitle={feat.requirements} description={feat.description} isOpen={!!openItems[uniqueKey]} onToggle={toggleItem} />;
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
}