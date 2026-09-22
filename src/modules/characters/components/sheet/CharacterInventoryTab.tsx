"use client";

import { useMemo } from "react";
import {
  type CharacterInventoryEntry,
  type CharacterNewItemState,
} from "@/modules/characters/components/sheet/shared";

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
};

const CURRENCY_LABELS: Record<string, { label: string; symbol: string }> = {
  copperPieces: { label: "Cuivre", symbol: "PC" },
  silverPieces: { label: "Argent", symbol: "PA" },
  electrumPieces: { label: "Électrum", symbol: "PE" },
  goldPieces: { label: "Or", symbol: "PO" },
  platinumPieces: { label: "Platine", symbol: "PP" },
};

export function CharacterInventoryTab({
  editing,
  activeInventory,
  setDraftInventory,
  newItem,
  setNewItem,
  onToggleEquip,
  equipPendingId,
  handleToggleEquip,
  wealth,
  setWealth,
}: CharacterInventoryTabProps) {
  const handleAddItem = () => {
    if (!newItem.name.trim()) return;

    const timestamp = Date.now();
    const itemToAdd: CharacterInventoryEntry = {
      id: `temp-item-${timestamp}`,
      quantity: Number(newItem.quantity) || 1,
      isEquipped: false,
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

  // Calcul du poids total transporté
  const totalWeight = useMemo(() => {
    return activeInventory.reduce((acc, entry) => {
      const weight = entry.item?.weightLb ?? 0;
      const qty = entry.quantity ?? 1;
      return acc + weight * qty;
    }, 0);
  }, [activeInventory]);

  return (
    <section
      className="mt-4 rounded-lg border p-4"
      style={{ borderColor: "var(--dnd-accent-soft)", background: "var(--dnd-surface)" }}
    >
      {/* 1. Bourse & Monnaies */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-[var(--dnd-ink)]">Bourse</h3>
        <span className="text-xs font-mono text-[var(--dnd-muted)]">
          Poids total transporté : <strong className="text-[var(--dnd-ink)]">{totalWeight.toFixed(1)} lb</strong>
        </span>
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

      {/* 2. Ajout d'objet en mode édition */}
      {editing && (
        <div
          className="mt-5 rounded-lg border border-dashed p-5"
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

      {/* 3. Liste des objets possédés */}
      <h3 className="mt-5 font-semibold text-[var(--dnd-ink)]">Objets possédés</h3>
      <ul className="mt-3 space-y-2 text-sm">
        {activeInventory.length === 0 ? (
          <li className="py-4 text-center text-xs italic" style={{ color: "var(--dnd-muted)" }}>
            Votre inventaire est vide.
          </li>
        ) : (
          activeInventory.map((entry) => {
            const canEquip = entry.item?.type === "ARMOR" || entry.item?.type === "SHIELD";

            return (
              <li
                key={entry.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded border p-2.5 transition-colors"
                style={{ borderColor: "var(--dnd-accent-soft)" }}
              >
                <div>
                  <strong className="text-[var(--dnd-ink)]">{entry.item?.name}</strong>{" "}
                  <span className="text-xs" style={{ color: "var(--dnd-muted)" }}>
                    · {entry.item?.category} · x{entry.quantity}
                    {entry.item?.weightLb ? ` · ${entry.item.weightLb} lb` : ""}
                    {entry.item?.armorClass ? ` · CA: ${entry.item.armorClass}` : ""}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Bouton Équiper en mode jeu direct (serveur) */}
                  {canEquip && onToggleEquip && !editing && (
                    <button
                      type="button"
                      disabled={equipPendingId === entry.id}
                      onClick={() => handleToggleEquip(entry.id)}
                      className="rounded border px-3 py-1 text-xs font-semibold transition-all disabled:opacity-50"
                      style={{
                        borderColor: "var(--dnd-accent)",
                        background: entry.isEquipped ? "var(--dnd-accent)" : "transparent",
                        color: entry.isEquipped ? "#fff" : "var(--dnd-ink)",
                      }}
                    >
                      {equipPendingId === entry.id
                        ? "..."
                        : entry.isEquipped
                        ? "Déséquiper"
                        : "Équiper"}
                    </button>
                  )}

                  {/* Bascule locale si on est en train d'éditer la fiche */}
                  {canEquip && editing && (
                    <button
                      type="button"
                      onClick={() => handleLocalToggleEquip(entry.id)}
                      className="rounded border px-3 py-1 text-xs font-semibold"
                      style={{
                        borderColor: "var(--dnd-accent)",
                        background: entry.isEquipped ? "var(--dnd-accent)" : "transparent",
                        color: entry.isEquipped ? "#fff" : "var(--dnd-ink)",
                      }}
                      title="Modifier l'état équipé pour cet enregistrement"
                    >
                      {entry.isEquipped ? "Équipé ✓" : "Non équipé"}
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
              </li>
            );
          })
        )}
      </ul>
    </section>
  );
}