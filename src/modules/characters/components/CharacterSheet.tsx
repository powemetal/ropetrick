"use client";

import { useState } from "react";
import { themeStyle, type DndThemeKey } from "@/styles/dnd-themes";
import {
  CharacterHeader,
  CharacterStats,
  CharacterSkills,
  CharacterSpellbookTab,
  CharacterFeatsTab,
  CharacterInventoryTab,
  CharacterBiographyTab,
} from "@/modules/characters/components/sheet";

import { CharacterLevelUpModal } from "@/modules/characters/components/sheet/CharacterLevelUpModal";

import {
  type CharacterSheetViewCharacter,
  type CharacterSheetUpdateData,
  type CharacterLevelUpData,
} from "@/modules/characters/components/sheet/shared";

import { CollapsibleSection } from "./sheet/CollapsibleSection";
import { useCharacterSheet } from "./sheet/useCharacterSheet";

export type { CharacterSheetUpdateData, CharacterLevelUpData };

type CharacterSheetProps = {
  characterId: string;
  character: CharacterSheetViewCharacter;
  onSave?: (data: CharacterSheetUpdateData) => Promise<void>;
  onLevelUp?: (data: CharacterLevelUpData) => Promise<void>;
  onToggleEquip?: (inventoryItemId: string) => Promise<void>;
  onUpdateTheme?: (themeKey: string) => Promise<void>;
};

export function CharacterSheet({ characterId, character, onSave, onLevelUp, onToggleEquip, onUpdateTheme }: CharacterSheetProps) {
  const sheet = useCharacterSheet(character, onSave, onLevelUp, onToggleEquip);

  // État pour afficher ou non la jolie modale de confirmation de fermeture d'édition
  const [showExitConfirmModal, setShowExitConfirmModal] = useState(false);

  const handleThemeChange = async (newTheme: string) => {
    const themeValue = newTheme as DndThemeKey;
    
    sheet.setTheme(themeValue);
    
    try {
      if (onUpdateTheme) {
        await onUpdateTheme(themeValue);
        return;
      }

      console.warn("[CharacterSheet] missing onUpdateTheme for theme change; refusing partial onSave payload");
    } catch (err) {
      console.error("Erreur lors de la sauvegarde du thème", err);
    }
  };

  // Intercepte l'action de bascule du mode édition
  const handleToggleEditing = () => {
    if (sheet.editing) {
      // Si on essaye de fermer l'édition, on déclenche notre modale personnalisée
      setShowExitConfirmModal(true);
    } else {
      // Si on ouvre l'édition, on l'active directement
      sheet.setEditing(true);
    }
  };

  // Confirmer l'enregistrement et fermer
  const handleConfirmSaveAndClose = async () => {
    await sheet.saveChanges();
    setShowExitConfirmModal(false);
  };

  // Abandonner les modifications et fermer
  const handleDiscardAndClose = () => {
    sheet.setEditing(false);
    setShowExitConfirmModal(false);
  };

  return (
    <section
      className="rounded-xl border p-4 shadow-lg sm:p-6"
      style={{
        ...themeStyle(sheet.theme),
        background: "var(--dnd-background)",
        color: "var(--dnd-ink)",
        borderColor: "var(--dnd-accent-soft)",
      }}
    >
      <CharacterHeader
        character={character}
        editing={sheet.editing}
        draftName={sheet.draftName}
        setDraftName={sheet.setDraftName}
        draftClass={sheet.draftClass}
        setDraftClass={sheet.setDraftClass}
        draftSubclass={sheet.draftSubclass}
        setDraftSubclass={sheet.setDraftSubclass}
        theme={sheet.theme}
        setTheme={handleThemeChange}
        onOpenLevelModal={onLevelUp ? () => sheet.setLevelModal(true) : undefined}
        onToggleEditing={onSave ? handleToggleEditing : undefined}
      />

      {/* 1. Caractéristiques & Santé */}
      <CollapsibleSection
        title="Caractéristiques & Santé"
        isCollapsed={sheet.collapsed.stats}
        onToggle={() => sheet.toggleCollapsed("stats")}
        maxHeightClass="max-h-[2000px]"
      >
        <CharacterStats
          character={character}
          editing={sheet.editing}
          displayedScores={sheet.displayedScores}
          draftScores={sheet.draftScores}
          setDraftScores={sheet.setDraftScores}
          hitPoints={sheet.hitPoints}
          setHitPoints={sheet.setHitPoints}
          maxHitPoints={sheet.maxHitPoints}
          temporaryHitPoints={sheet.temporaryHitPoints}
          setTemporaryHitPoints={sheet.setTemporaryHitPoints}
          hitDice={sheet.hitDice}
          setHitDice={sheet.setHitDice}
          inspiration={sheet.inspiration}
          setInspiration={sheet.setInspiration}
        />
      </CollapsibleSection>

      {/* 2. Compétences & Aptitudes */}
      <CollapsibleSection
        title="Compétences & Aptitudes"
        isCollapsed={sheet.collapsed.skills}
        onToggle={() => sheet.toggleCollapsed("skills")}
        maxHeightClass="max-h-[2000px]"
      >
        <CharacterSkills
          character={character}
          editing={sheet.editing}
          proficiencies={sheet.proficiencies}
          cycleSkill={sheet.cycleSkill}
          skillBonuses={sheet.skillBonuses}
          activeFeats={sheet.activeFeats}
          classFeaturesAtLevel={sheet.classFeaturesAtLevel}
          onNavigateToFeatsTab={() => sheet.setActiveTab("feats")}
          onTogglePin={sheet.handleTogglePin}
        />
      </CollapsibleSection>

      {/* 3. Détails & Grimoire (Onglets) */}
      <CollapsibleSection
        title="Détails du personnage"
        isCollapsed={sheet.collapsed.details}
        onToggle={() => sheet.toggleCollapsed("details")}
        maxHeightClass="max-h-[3500px]"
      >
        {/* Barre d'onglets et bouton d'édition rapide intégrés juste au-dessus du Grimoire/Dons */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-3 mb-4" style={{ borderColor: "var(--dnd-accent-soft)" }}>
          <nav
            className="flex flex-wrap gap-2"
            aria-label="Onglets de fiche"
          >
            {[
              ["spellbook", "Grimoire"],
              ["feats", "Dons & Aptitudes"],
              ["inventory", "Inventaire & bourse"],
              ["biography", "Biographie"],
            ].map(([val, label]) => (
              <button
                key={`tab-${val}`}
                type="button"
                onClick={() => sheet.setActiveTab(val as typeof sheet.activeTab)}
                className="rounded px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors"
                style={{
                  background: sheet.activeTab === val ? "var(--dnd-accent)" : "transparent",
                  color: sheet.activeTab === val ? "#fff" : "var(--dnd-ink)",
                  border: sheet.activeTab === val ? "none" : "1px solid var(--dnd-accent-soft)",
                }}
              >
                {label}
              </button>
            ))}
          </nav>

          {/* Bouton d'édition rapide placé juste ici */}
          {onSave && (
            <button
              type="button"
              onClick={handleToggleEditing}
              className="rounded-md px-3 py-2 text-xs font-bold text-white transition-all shadow-sm shrink-0"
              style={{ background: "var(--dnd-accent)" }}
            >
              {sheet.editing ? "✓ Fermer l'édition" : "✎ Modifier la fiche"}
            </button>
          )}
        </div>

        {sheet.activeTab === "spellbook" && (
          <CharacterSpellbookTab
            editing={sheet.editing}
            spellSaveDc={sheet.spellSaveDc}
            spellAttackBonus={sheet.spellAttackBonus}
            cantrips={sheet.cantrips}
            leveledSpells={sheet.leveledSpells}
            newSpell={sheet.newSpell}
            setNewSpell={sheet.setNewSpell}
            setDraftSpells={sheet.setDraftSpells}
            slots={sheet.slots}
            setSlots={sheet.setSlots}
            availableSpells={sheet.availableSpells}
          />
        )}

        {sheet.activeTab === "feats" && (
          <CharacterFeatsTab
            character={character}
            editing={sheet.editing}
            activeFeats={sheet.activeFeats}
            setDraftFeats={sheet.setDraftFeats}
            newFeat={sheet.newFeat}
            setNewFeat={sheet.setNewFeat}
            classFeaturesAtLevel={sheet.classFeaturesAtLevel}
            availableFeats={sheet.availableFeats}
            onTogglePin={sheet.handleTogglePin}
          />
        )}

        {sheet.activeTab === "inventory" && (
          <CharacterInventoryTab
            editing={sheet.editing}
            activeInventory={sheet.activeInventory}
            setDraftInventory={sheet.setDraftInventory}
            newItem={sheet.newItem}
            setNewItem={sheet.setNewItem}
            onToggleEquip={onToggleEquip}
            equipPendingId={sheet.equipPendingId}
            handleToggleEquip={sheet.handleToggleEquip}
            wealth={sheet.wealth}
            setWealth={sheet.setWealth}
          />
        )}

        {sheet.activeTab === "biography" && (
          <CharacterBiographyTab
            biography={sheet.biography}
            setBiography={sheet.setBiography}
          />
        )}
      </CollapsibleSection>

      {sheet.editing && onSave && (
        <button
          type="button"
          disabled={sheet.pending}
          onClick={sheet.saveChanges}
          className="mt-5 w-full rounded-md px-4 py-3 text-sm font-semibold text-white shadow-md disabled:opacity-50"
          style={{ background: "var(--dnd-accent)" }}
        >
          {sheet.pending ? "Enregistrement..." : "Enregistrer les modifications"}
        </button>
      )}

      {sheet.error && (
        <p role="alert" className="mt-3 text-sm text-red-600 font-medium">
          {sheet.error}
        </p>
      )}

      {/* Belle modale de confirmation personnalisée */}
      {showExitConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div 
            className="w-full max-w-md rounded-2xl border p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150"
            style={{ 
              background: "var(--dnd-surface)", 
              borderColor: "var(--dnd-accent)",
              color: "var(--dnd-ink)" 
            }}
          >
            <h3 className="text-base font-bold uppercase tracking-wider" style={{ color: "var(--dnd-accent)" }}>
              Quitter le mode édition ?
            </h3>
            <p className="text-sm opacity-90 leading-relaxed">
              Souhaitez-vous enregistrer vos modifications avant de quitter le mode édition, ou préférez-vous les abandonner ?
            </p>
            <div className="flex flex-col sm:flex-row justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleDiscardAndClose}
                className="rounded-lg border px-4 py-2 text-xs font-bold transition-all opacity-80 hover:opacity-100"
                style={{ borderColor: "var(--dnd-accent-soft)" }}
              >
                Abandonner
              </button>
              <button
                type="button"
                disabled={sheet.pending}
                onClick={handleConfirmSaveAndClose}
                className="rounded-lg px-4 py-2 text-xs font-bold text-white transition-all shadow-md hover:opacity-95 disabled:opacity-50"
                style={{ background: "var(--dnd-accent)" }}
              >
                {sheet.pending ? "Enregistrement..." : "Enregistrer et fermer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {sheet.levelModal && (
        <CharacterLevelUpModal
          level={character.level}
          currentClassName={character.className ?? "Guerrier"}
          hasSubclass={sheet.hasSubclass}
          availableSubclasses={sheet.availableSubclasses}
          availableFeats={sheet.availableFeats}
          availableSpells={sheet.availableLevelUpSpells}
          spellSelectionCount={sheet.spellSelectionCount}
          maxSpellLevel={sheet.maxSpellLevel}
          selectedSpellIds={sheet.selectedSpellIds}
          setSelectedSpellIds={sheet.setSelectedSpellIds}
          pending={sheet.pending}
          hitPointMethod={sheet.hitPointMethod}
          setHitPointMethod={sheet.setHitPointMethod}
          abilityIncrease={sheet.abilityIncrease}
          setAbilityIncrease={sheet.setAbilityIncrease}
          feat={sheet.feat}
          setFeat={sheet.setFeat}
          subclassId={sheet.subclassId}
          setSubclassId={sheet.setSubclassId}
          newClassName={sheet.newClassName}
          setNewClassName={sheet.setNewClassName}
          multiclassEligibility={sheet.multiclassEligibility}
          legalAsiLevels={sheet.legalAsiLevels}
          onCancel={() => {
            sheet.setLevelModal(false);
            sheet.setError(null);
          }}
          onConfirm={sheet.confirmLevelUp}
        />
      )}
    </section>
  );
}