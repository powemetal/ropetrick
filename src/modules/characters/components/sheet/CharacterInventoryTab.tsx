"use client";

import { useState, useMemo } from "react";
import {
  type CharacterInventoryEntry,
  type CharacterNewItemState,
} from "@/modules/characters/components/sheet/shared";
import { calculateWeaponStats } from "@/modules/characters/engine/dnd-rules-engine";

type CharacterInventoryTabProps = {
  editing: boolean;
  activeInventory: CharacterInventoryEntry[];
  setDraftInventory: (
    value:
      | CharacterInventoryEntry[]
      | ((current: CharacterInventoryEntry[]) => CharacterInventoryEntry[])
  ) => void;
  newItem: CharacterNewItemState;
  setNewItem: (
    value: CharacterNewItemState | ((current: CharacterNewItemState) => CharacterNewItemState)
  ) => void;
  onToggleEquip?: (inventoryItemId: string) => Promise<void>;
  equipPendingId: string | null;
  handleToggleEquip: (inventoryItemId: string) => void;
  onToggleAttune?: (inventoryItemId: string) => Promise<void> | void;
  attunementPendingId?: string | null;
  wealth: {
    copperPieces: number;
    silverPieces: number;
    electrumPieces: number;
    goldPieces: number;
    platinumPieces: number;
  };
  setWealth: (
    value:
      | {
          copperPieces: number;
          silverPieces: number;
          electrumPieces: number;
          goldPieces: number;
          platinumPieces: number;
        }
      | ((current: {
          copperPieces: number;
          silverPieces: number;
          electrumPieces: number;
          goldPieces: number;
          platinumPieces: number;
        }) => {
          copperPieces: number;
          silverPieces: number;
          electrumPieces: number;
          goldPieces: number;
          platinumPieces: number;
        })
  ) => void;
  strength?: number;
  strengthMod?: number;
  dexterityMod?: number;
  level?: number;
};

const CURRENCY_LABELS: Record<string, { label: string; symbol: string }> = {
  copperPieces: { label: "Cuivre", symbol: "PC" },
  silverPieces: { label: "Argent", symbol: "PA" },
  electrumPieces: { label: "Électrum", symbol: "PE" },
  goldPieces: { label: "Or", symbol: "PO" },
  platinumPieces: { label: "Platine", symbol: "PP" },
};

const CATEGORY_LABELS: Record<string, string> = {
  WEAPON: "⚔️ Armes",
  CONSUMABLE: "🧪 Consommables (Potions, Parchemins)",
  MAGIC_ITEM: "✨ Objets Magiques",
  ARMOR: "🛡️ Armures",
  SHIELD: "🛡️ Boucliers",
  TOOL: "🛠️ Outils & Kits",
  GEAR: "🎒 Équipement d'aventure & Divers",
};

const CATEGORY_PRIORITY = ["WEAPON", "CONSUMABLE", "MAGIC_ITEM", "ARMOR", "SHIELD", "TOOL", "GEAR"];

function normalizeItemType(rawType: unknown): string {
  if (!rawType) return "GEAR";

  const cleaned = String(rawType)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");

  if (cleaned.includes("weapon") || cleaned.includes("weoapon") || cleaned.includes("martial") || cleaned.includes("simple")) {
    return "WEAPON";
  }
  if (cleaned.includes("armor") || cleaned.includes("armour")) {
    return "ARMOR";
  }
  if (cleaned.includes("shield")) {
    return "SHIELD";
  }
  if (cleaned.includes("tool")) {
    return "TOOL";
  }
  if (cleaned.includes("consumable") || cleaned.includes("potion") || cleaned.includes("scroll")) {
    return "CONSUMABLE";
  }
  if (cleaned.includes("magic") || cleaned.includes("wondrous")) {
    return "MAGIC_ITEM";
  }

  const upper = String(rawType).toUpperCase();
  if (["WEAPON", "ARMOR", "SHIELD", "MAGIC_ITEM", "TOOL", "CONSUMABLE", "GEAR"].includes(upper)) {
    return upper;
  }

  return "GEAR";
}

export function CharacterInventoryTab({
  editing,
  activeInventory,
  setDraftInventory,
  newItem,
  setNewItem,
  onToggleEquip,
  equipPendingId,
  handleToggleEquip,
  onToggleAttune,
  attunementPendingId = null,
  wealth,
  setWealth,
  strength = 10,
  strengthMod = 0,
  dexterityMod = 0,
  level = 1,
}: CharacterInventoryTabProps) {
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleCategory = (categoryKey: string) => {
    setCollapsedCategories((prev) => ({ ...prev, [categoryKey]: !prev[categoryKey] }));
  };

  const toggleItemDetails = (itemId: string) => {
    setExpandedItems((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const handleAddItem = () => {
    if (!newItem.name.trim()) return;

    const timestamp = Date.now();
    const itemToAdd: CharacterInventoryEntry = {
      id: `temp-item-${timestamp}`,
      quantity: Number(newItem.quantity) || 1,
      isEquipped: false,
      isAttuned: false,
      item: {
        id: `temp-subitem-${timestamp}`,
        name: newItem.name.trim(),
        category: newItem.category.trim() || "Équipement d'aventure",
        type: newItem.type,
        costGp: Math.max(0, Number(newItem.costGp) || 0),
        weightLb: Math.max(0, Number(newItem.weightLb) || 0),
        armorClass: newItem.armorClass ? Number(newItem.armorClass) : null,
      },
    };

    setDraftInventory((current) => [...current, itemToAdd]);
    setNewItem({
      name: "",
      category: "Équipement d'aventure",
      type: "GEAR",
      quantity: 1,
      weightLb: 1,
      costGp: 1,
      armorClass: 0,
    });
  };

  const handleRemoveItem = (id: string) => {
    setDraftInventory((current) => current.filter((item) => item.id !== id));
  };

  const handleLocalToggleEquip = (id: string) => {
    setDraftInventory((current) =>
      current.map((entry) => {
        if (entry.id !== id) return entry;
        return { ...entry, isEquipped: !entry.isEquipped };
      })
    );
  };

  const handleLocalToggleAttune = (id: string) => {
    setDraftInventory((current) => {
      const target = current.find((item) => item.id === id);
      if (!target) return current;

      const currentAttuned = (target as any).isAttuned ?? (target.item as any)?.attuned ?? false;
      const newState = !currentAttuned;

      if (newState) {
        const currentAttunedCount = current.filter((item) => {
          const attuned = (item as any).isAttuned ?? (item.item as any)?.attuned ?? false;
          return attuned && item.id !== id;
        }).length;

        if (currentAttunedCount >= 3) {
          alert("Impossible d'harmoniser plus de 3 objets magiques simultanément.");
          return current;
        }
      }

      return current.map((entry) => {
        if (entry.id !== id) return entry;
        return {
          ...entry,
          isAttuned: newState,
          item: entry.item
            ? {
                ...entry.item,
                attuned: newState,
              }
            : entry.item,
        };
      });
    });
  };

  const totalWeight = useMemo(() => {
    return activeInventory.reduce((acc, entry) => {
      const subItem = entry.item as any;
      const weight = subItem?.weightLb ?? subItem?.weight?.value ?? 0;
      const qty = entry.quantity ?? 1;
      return acc + weight * qty;
    }, 0);
  }, [activeInventory]);

  const maxCapacity = strength * 15;
  const weightPercentage = Math.min(100, (totalWeight / maxCapacity) * 100);

  const attunedCount = activeInventory.filter((item) => {
    return (item as any).isAttuned || (item.item as any)?.attuned === true;
  }).length;

  const groupedInventory = useMemo(() => {
    const groups: Record<string, CharacterInventoryEntry[]> = {};
    activeInventory.forEach((entry) => {
      const subItem = entry.item as any;
      const rawType = subItem?.type?.value || subItem?.type || "GEAR";
      const normalizedKey = normalizeItemType(rawType);

      if (!groups[normalizedKey]) {
        groups[normalizedKey] = [];
      }
      groups[normalizedKey].push(entry);
    });

    const sortedGroups: Record<string, CharacterInventoryEntry[]> = {};
    const sortedKeys = Object.keys(groups).sort((a, b) => {
      const indexA = CATEGORY_PRIORITY.indexOf(a);
      const indexB = CATEGORY_PRIORITY.indexOf(b);
      const priorityA = indexA === -1 ? 999 : indexA;
      const priorityB = indexB === -1 ? 999 : indexB;
      return priorityA - priorityB;
    });

    for (const key of sortedKeys) {
      sortedGroups[key] = groups[key];
    }

    return sortedGroups;
  }, [activeInventory]);

  return (
    <section
      className="mt-4 rounded-lg border p-4 space-y-5"
      style={{ borderColor: "var(--dnd-accent-soft)", background: "var(--dnd-surface)" }}
    >
      {/* 0. Blocs de Statut : Charge & Harmonisation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border p-3" style={{ borderColor: "var(--dnd-accent-soft)" }}>
          <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider mb-2">
            <span style={{ color: "var(--dnd-muted)" }}>Charge portée</span>
            <span>
              {totalWeight.toFixed(1)} lb / {maxCapacity} lb
            </span>
          </div>
          <div className="w-full bg-black/10 dark:bg-white/10 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${totalWeight > maxCapacity ? "bg-red-500" : ""}`}
              style={{
                width: `${weightPercentage}%`,
                background: totalWeight > maxCapacity ? undefined : "var(--dnd-accent)",
              }}
            />
          </div>
          {totalWeight > maxCapacity && (
            <p className="text-[11px] text-red-500 font-medium mt-1">⚠️ Surchargé ! Vitesse réduite.</p>
          )}
        </div>

        <div className="rounded-lg border p-3 flex flex-col justify-between" style={{ borderColor: "var(--dnd-accent-soft)" }}>
          <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider mb-2">
            <span style={{ color: "var(--dnd-muted)" }}>Objets Harmonisés</span>
            <span className={attunedCount > 3 ? "text-red-500 font-bold" : ""}>{attunedCount} / 3 slots</span>
          </div>
          <div className="flex gap-2">
            {[0, 1, 2].map((slotIndex) => {
              const isFilled = slotIndex < attunedCount;
              return (
                <div
                  key={`attunement-slot-${slotIndex}`}
                  className={`flex-1 h-7 rounded border flex items-center justify-center text-[10px] font-bold transition-all ${
                    isFilled
                      ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      : "border-dashed border-[var(--dnd-accent-soft)] text-[var(--dnd-muted)]"
                  }`}
                >
                  {isFilled ? `Slot ${slotIndex + 1}` : "Vide"}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 1. Bourse & Monnaies */}
      <div>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-[var(--dnd-ink)]">Bourse</h3>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {Object.entries(wealth).map(([currency, amount]) => {
            const info = CURRENCY_LABELS[currency] ?? { label: currency, symbol: "" };
            return (
              <label
                key={currency}
                className="flex flex-col rounded-lg border p-2 text-xs font-semibold"
                style={{ borderColor: "var(--dnd-accent-soft)" }}
              >
                <div className="flex justify-between items-center text-[10px] uppercase text-[var(--dnd-muted)]">
                  <span>{info.label}</span>
                  <span className="font-bold text-[var(--dnd-accent)]">{info.symbol}</span>
                </div>
                <input
                  type="number"
                  min="0"
                  disabled={!editing}
                  value={amount}
                  onChange={(event) =>
                    setWealth((current) => ({
                      ...current,
                      [currency]: Math.max(0, Number(event.target.value)),
                    }))
                  }
                  className="mt-1 w-full bg-transparent text-sm font-bold outline-none disabled:opacity-80"
                />
              </label>
            );
          })}
        </div>
      </div>

      {/* 2. Ajout d'objet en mode édition */}
      {editing && (
        <div
          className="rounded-lg border border-dashed p-5"
          style={{ borderColor: "var(--dnd-accent)", background: "var(--dnd-surface)" }}
        >
          <div className="border-b pb-2" style={{ borderColor: "var(--dnd-accent-soft)" }}>
            <h4 className="text-sm font-semibold">Ajouter un objet à l&apos;inventaire</h4>
            <p className="text-xs" style={{ color: "var(--dnd-muted)" }}>
              Les armures et boucliers influencent directement la Classe d&apos;Armure (CA) lorsqu&apos;ils sont équipés.
            </p>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="grid gap-1 text-xs font-semibold">
              <span>
                Nom de l&apos;objet <span className="text-red-500">*</span>
              </span>
              <input
                placeholder="Ex: Cotte de mailles, Rapière..."
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                className="rounded border bg-transparent px-3 py-1.5 text-sm font-normal outline-none"
                style={{ borderColor: "var(--dnd-accent-soft)" }}
              />
            </label>

            <label className="grid gap-1 text-xs font-semibold">
              <span>Type d&apos;objet mécanique</span>
              <select
                value={newItem.type}
                onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
                className="rounded border bg-transparent px-3 py-1.5 text-sm font-normal outline-none"
                style={{ borderColor: "var(--dnd-accent-soft)" }}
              >
                <option value="GEAR">Équipement général / Objet divers</option>
                <option value="WEAPON">Arme</option>
                <option value="ARMOR">Armure (base de protection)</option>
                <option value="SHIELD">Bouclier (+2 CA par défaut)</option>
                <option value="MAGIC_ITEM">Objet Magique</option>
                <option value="TOOL">Outil / Kit</option>
                <option value="CONSUMABLE">Consommable (potion, parchemin)</option>
              </select>
            </label>

            <label className="grid gap-1 text-xs font-semibold">
              <span>Catégorie / Emplacement</span>
              <input
                placeholder="Ex: Arme courante, Armure lourde..."
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                className="rounded border bg-transparent px-3 py-1.5 text-sm font-normal outline-none"
                style={{ borderColor: "var(--dnd-accent-soft)" }}
              />
            </label>

            <label className="grid gap-1 text-xs font-semibold">
              <span>Quantité</span>
              <input
                type="number"
                min="1"
                value={newItem.quantity}
                onChange={(e) =>
                  setNewItem({ ...newItem, quantity: Math.max(1, Number(e.target.value)) })
                }
                className="rounded border bg-transparent px-3 py-1.5 text-sm font-normal outline-none"
                style={{ borderColor: "var(--dnd-accent-soft)" }}
              />
            </label>

            <label className="grid gap-1 text-xs font-semibold">
              <span>Poids unitaire (lb)</span>
              <input
                type="number"
                step="0.1"
                min="0"
                placeholder="0"
                value={newItem.weightLb}
                onChange={(e) =>
                  setNewItem({ ...newItem, weightLb: Math.max(0, Number(e.target.value)) })
                }
                className="rounded border bg-transparent px-3 py-1.5 text-sm font-normal outline-none"
                style={{ borderColor: "var(--dnd-accent-soft)" }}
              />
            </label>

            <label className="grid gap-1 text-xs font-semibold">
              <span>Valeur (PO)</span>
              <input
                type="number"
                step="0.1"
                min="0"
                placeholder="0"
                value={newItem.costGp}
                onChange={(e) =>
                  setNewItem({ ...newItem, costGp: Math.max(0, Number(e.target.value)) })
                }
                className="rounded border bg-transparent px-3 py-1.5 text-sm font-normal outline-none"
                style={{ borderColor: "var(--dnd-accent-soft)" }}
              />
            </label>

            {(newItem.type === "ARMOR" || newItem.type === "SHIELD") && (
              <label className="grid gap-1 text-xs font-semibold sm:col-span-2 lg:col-span-3">
                <span>
                  {newItem.type === "ARMOR"
                    ? "Classe d'Armure (CA de base fournie par l'armure)"
                    : "Bonus de CA (+2 pour un bouclier standard)"}
                </span>
                <input
                  type="number"
                  min="0"
                  max="30"
                  placeholder={newItem.type === "ARMOR" ? "Ex: 14" : "Ex: 2"}
                  value={newItem.armorClass || ""}
                  onChange={(e) =>
                    setNewItem({ ...newItem, armorClass: Number(e.target.value) })
                  }
                  className="rounded border bg-transparent px-3 py-1.5 text-sm font-normal outline-none"
                  style={{ borderColor: "var(--dnd-accent)" }}
                />
              </label>
            )}
          </div>

          <div
            className="mt-4 flex items-center justify-between border-t pt-3"
            style={{ borderColor: "var(--dnd-accent-soft)" }}
          >
            <span className="text-xs" style={{ color: "var(--dnd-muted)" }}>
              L&apos;objet sera ajouté à votre inventaire local prêt pour la sauvegarde.
            </span>
            <button
              type="button"
              onClick={handleAddItem}
              className="rounded px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: "var(--dnd-accent)" }}
            >
              + Ajouter à l&apos;inventaire
            </button>
          </div>
        </div>
      )}

      {/* 3. Liste des objets possédés (Regroupés, triés et Collapsible) */}
      <div className="space-y-4">
        <h3 className="font-semibold text-[var(--dnd-ink)]">Objets possédés par catégorie</h3>

        {activeInventory.length === 0 ? (
          <p className="py-4 text-center text-xs italic" style={{ color: "var(--dnd-muted)" }}>
            Votre inventaire est vide.
          </p>
        ) : (
          Object.entries(groupedInventory).map(([typeKey, entries]) => {
            const isCollapsed = collapsedCategories[typeKey] ?? false;
            const categoryTitle = CATEGORY_LABELS[typeKey] || `📦 ${typeKey.toUpperCase()}`;

            return (
              <div 
                key={typeKey}
                className="rounded-lg border overflow-hidden"
                style={{ borderColor: "var(--dnd-accent-soft)" }}
              >
                <button
                  type="button"
                  onClick={() => toggleCategory(typeKey)}
                  className="w-full flex items-center justify-between p-3 text-xs font-bold uppercase tracking-wider bg-black/5 dark:bg-white/5 transition-colors hover:opacity-80"
                  style={{ color: "var(--dnd-ink)" }}
                >
                  <span>
                    {categoryTitle} ({entries.length})
                  </span>
                  <span>{isCollapsed ? "▼" : "▲"}</span>
                </button>

                {!isCollapsed && (
                  <ul className="divide-y divide-[var(--dnd-accent-soft)] text-sm">
                    {entries.map((entry) => {
                      const subItem = entry.item as any;
                      
                      const normalizedSubtype = normalizeItemType(subItem?.type?.value || subItem?.type);
                      const canEquip =
                        normalizedSubtype === "ARMOR" ||
                        normalizedSubtype === "SHIELD" ||
                        normalizedSubtype === "WEAPON" ||
                        subItem?.equipped !== undefined;

                      const isEquipped = entry.isEquipped || subItem?.equipped === true;
                      const isAttuned = (entry as any).isAttuned || subItem?.attuned === true;
                      
                      const requiresAttunement =
                        subItem?.attunement === 1 ||
                        subItem?.attunement === 2 ||
                        subItem?.attunement === "required" ||
                        subItem?.requiresAttunement === true ||
                        subItem?.rarity === "rare" ||
                        subItem?.rarity === "veryRare" ||
                        subItem?.rarity === "legendary" ||
                        normalizedSubtype === "MAGIC_ITEM";

                      const isExpanded = expandedItems[entry.id] ?? false;

                      const rawDescription = subItem?.description?.value || subItem?.description || "";
                      const weightVal = subItem?.weightLb ?? subItem?.weight?.value ?? 0;
                      const priceVal = subItem?.costGp ?? subItem?.price?.value ?? 0;
                      const rarityVal = subItem?.rarity;

                      // Si c'est une arme, on calcule ses stats de combat pour l'affichage
                      const weaponStats = normalizedSubtype === "WEAPON"
                        ? calculateWeaponStats({
                            weapon: entry,
                            strengthModifier: strengthMod,
                            dexterityModifier: dexterityMod,
                            level,
                          })
                        : null;

                      return (
                        <li key={entry.id} className="p-3 transition-colors">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div 
                              className="flex-1 cursor-pointer select-none"
                              onClick={() => toggleItemDetails(entry.id)}
                            >
                              <div className="flex items-center gap-2">
                                <strong className="text-[var(--dnd-ink)] hover:underline">
                                  {subItem?.name}
                                </strong>
                                {rarityVal && (
                                  <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400">
                                    {rarityVal}
                                  </span>
                                )}
                                <span className="text-xs text-[var(--dnd-muted)]">
                                  {isExpanded ? "▼ Masquer" : "▶ Détails"}
                                </span>
                              </div>
                              <span className="text-xs" style={{ color: "var(--dnd-muted)" }}>
                                · {subItem?.category || normalizedSubtype} · x{entry.quantity}
                                {weightVal ? ` · ${weightVal * entry.quantity} lb` : ""}
                                {subItem?.armorClass ? ` · CA: ${subItem.armorClass}` : ""}
                              </span>

                              {/* Affichage direct des stats d'attaque, dégâts et du détail (breakdown) pour les armes */}
                              {weaponStats && (
                                <div className="mt-1.5 space-y-1">
                                  <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-amber-600 dark:text-amber-400">
                                    <span>⚔️ Atq : {weaponStats.attackBonus}</span>
                                    <span>💥 Dégâts : {weaponStats.damageFormula} {weaponStats.damageType ? `(${weaponStats.damageType})` : ""}</span>
                                  </div>
                                  <div className="text-[11px] italic text-[var(--dnd-muted)]">
                                    💡 Détail : {weaponStats.breakdown}
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {requiresAttunement && (
                                <>
                                  {!editing && onToggleAttune ? (
                                    <button
                                      type="button"
                                      disabled={attunementPendingId === entry.id}
                                      onClick={() => onToggleAttune(entry.id)}
                                      className={`rounded border px-2.5 py-1 text-xs font-semibold transition-all disabled:opacity-50 ${
                                        isAttuned
                                          ? "bg-amber-500 border-amber-500 text-white"
                                          : "border-[var(--dnd-accent-soft)] hover:border-amber-500"
                                      }`}
                                      title="Harmonisation magique (3 max)"
                                    >
                                      {attunementPendingId === entry.id
                                        ? "..."
                                        : isAttuned
                                        ? "Harmonisé ⚡"
                                        : "S'harmoniser"}
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleLocalToggleAttune(entry.id)}
                                      className={`rounded border px-2.5 py-1 text-xs font-semibold transition-all ${
                                        isAttuned
                                          ? "bg-amber-500 border-amber-500 text-white"
                                          : "border-[var(--dnd-accent-soft)] hover:border-amber-500"
                                      }`}
                                      title="Harmonisation magique (3 max)"
                                    >
                                      {isAttuned ? "Harmonisé ⚡" : "S'harmoniser"}
                                    </button>
                                  )}
                                </>
                              )}

                              {canEquip && onToggleEquip && !editing && (
                                <button
                                  type="button"
                                  disabled={equipPendingId === entry.id}
                                  onClick={() => handleToggleEquip(entry.id)}
                                  className="rounded border px-3 py-1 text-xs font-semibold transition-all disabled:opacity-50"
                                  style={{
                                    borderColor: "var(--dnd-accent)",
                                    background: isEquipped ? "var(--dnd-accent)" : "transparent",
                                    color: isEquipped ? "#fff" : "var(--dnd-ink)",
                                  }}
                                >
                                  {equipPendingId === entry.id
                                    ? "..."
                                    : isEquipped
                                    ? "Déséquiper"
                                    : "Équipé"}
                                </button>
                              )}

                              {canEquip && editing && (
                                <button
                                  type="button"
                                  onClick={() => handleLocalToggleEquip(entry.id)}
                                  className="rounded border px-3 py-1 text-xs font-semibold"
                                  style={{
                                    borderColor: "var(--dnd-accent)",
                                    background: isEquipped ? "var(--dnd-accent)" : "transparent",
                                    color: isEquipped ? "#fff" : "var(--dnd-ink)",
                                  }}
                                >
                                  {isEquipped ? "Équipé ✓" : "Non équipé"}
                                </button>
                              )}

                              {editing && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(entry.id)}
                                  className="text-xs text-red-600 hover:underline px-1"
                                >
                                  Supprimer
                                </button>
                              )}
                            </div>
                          </div>

                          {isExpanded && (
                            <div 
                              className="mt-3 pt-3 border-t text-xs space-y-2 rounded p-2.5 bg-black/5 dark:bg-white/5"
                              style={{ borderColor: "var(--dnd-accent-soft)" }}
                            >
                              <div className="flex flex-wrap gap-4 text-[11px] font-medium text-[var(--dnd-muted)]">
                                {priceVal > 0 && <span>💰 Valeur : {priceVal} PO</span>}
                                {weightVal > 0 && <span>⚖️ Poids unitaire : {weightVal} lb</span>}
                                {subItem?.source?.book && <span>📖 Source : {subItem.source.book}</span>}
                              </div>

                              {rawDescription ? (
                                <div 
                                  className="prose dark:prose-invert text-xs max-w-none leading-relaxed"
                                  dangerouslySetInnerHTML={{ __html: rawDescription }}
                                />
                              ) : (
                                <p className="italic text-[var(--dnd-muted)]">Aucune description disponible pour cet objet.</p>
                              )}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}