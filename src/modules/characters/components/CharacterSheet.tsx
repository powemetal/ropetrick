"use client";

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
};

export function CharacterSheet({ character, onSave, onLevelUp, onToggleEquip }: CharacterSheetProps) {
  const sheet = useCharacterSheet(character, onSave, onLevelUp, onToggleEquip);

  const handleThemeChange = async (newTheme: string) => {
    const themeValue = newTheme as DndThemeKey;
    
    sheet.setTheme(themeValue);
    
    if (onSave) {
      try {
        await onSave({ themeKey: themeValue } as any);
      } catch (err) {
        console.error("Erreur lors de la sauvegarde du thème", err);
      }
    }
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
        onToggleEditing={onSave ? () => sheet.setEditing((c) => !c) : undefined}
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
        />
      </CollapsibleSection>

      {/* 3. Détails & Grimoire (Onglets) */}
      <CollapsibleSection
        title="Détails du personnage"
        isCollapsed={sheet.collapsed.details}
        onToggle={() => sheet.toggleCollapsed("details")}
        maxHeightClass="max-h-[3500px]"
      >
        <nav
          className="flex flex-wrap gap-2 border-b pb-3 mb-4"
          style={{ borderColor: "var(--dnd-accent-soft)" }}
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