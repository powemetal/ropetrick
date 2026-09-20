"use client";

import { type CharacterInventoryEntry, type CharacterNewItemState } from "@/modules/characters/components/sheet/shared";

type CharacterInventoryTabProps = {
  editing: boolean;
  activeInventory: CharacterInventoryEntry[];
  setDraftInventory: (value: CharacterInventoryEntry[] | ((current: CharacterInventoryEntry[]) => CharacterInventoryEntry[])) => void;
  newItem: CharacterNewItemState;
  setNewItem: (value: CharacterNewItemState | ((current: CharacterNewItemState) => CharacterNewItemState)) => void;
  onToggleEquip?: (inventoryItemId: string) => Promise<void>;
  equipPendingId: string | null;
  handleToggleEquip: (inventoryItemId: string) => void;
  wealth: { copperPieces: number; silverPieces: number; electrumPieces: number; goldPieces: number; platinumPieces: number };
  setWealth: (value: { copperPieces: number; silverPieces: number; electrumPieces: number; goldPieces: number; platinumPieces: number } | ((current: { copperPieces: number; silverPieces: number; electrumPieces: number; goldPieces: number; platinumPieces: number }) => { copperPieces: number; silverPieces: number; electrumPieces: number; goldPieces: number; platinumPieces: number })) => void;
};

export function CharacterInventoryTab({ editing, activeInventory, setDraftInventory, newItem, setNewItem, onToggleEquip, equipPendingId, handleToggleEquip, wealth, setWealth }: CharacterInventoryTabProps) {
  const handleAddItem = () => {
    if (!newItem.name.trim()) return;
    const itemToAdd: CharacterInventoryEntry = {
      id: `temp-item-${Date.now()}`,
      quantity: Number(newItem.quantity) || 1,
      isEquipped: false,
      item: {
        id: `temp-subitem-${Date.now()}`,
        name: newItem.name.trim(),
        category: newItem.category,
        type: newItem.type,
        costGp: Number(newItem.costGp) || 0,
        weightLb: Number(newItem.weightLb) || 0,
        armorClass: newItem.armorClass ? Number(newItem.armorClass) : null,
      },
    };
    setDraftInventory((current) => [...current, itemToAdd]);
    setNewItem({ name: "", category: "Équipement d'aventure", type: "GEAR", quantity: 1, weightLb: 1, costGp: 1, armorClass: 0 });
  };

  const handleRemoveItem = (id: string) => {
    setDraftInventory((current) => current.filter((item) => item.id !== id));
  };

  return (
    <section className="mt-4 rounded-lg border p-4" style={{ borderColor: "var(--dnd-accent-soft)", background: "var(--dnd-surface)" }}>
      <h3 className="font-semibold">Bourse</h3>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {Object.entries(wealth).map(([currency, amount]) => (
          <label key={currency} className="text-sm">
            {currency.replace("Pieces", "")}
            <input type="number" min="0" value={amount} onChange={(event) => setWealth((current) => ({ ...current, [currency]: Number(event.target.value) }))} className="mt-1 w-full rounded border bg-transparent px-2 py-1" />
          </label>
        ))}
      </div>

      {editing && (
        <div className="mt-5 rounded-lg border border-dashed p-5" style={{ borderColor: "var(--dnd-accent)", background: "var(--dnd-surface)" }}>
          <div className="border-b pb-2" style={{ borderColor: "var(--dnd-accent-soft)" }}>
            <h4 className="text-base font-semibold">Ajouter un objet à l&apos;inventaire</h4>
            <p className="text-xs" style={{ color: "var(--dnd-muted)" }}>
              Renseignez les propriétés de l&apos;objet. Les armes, armures et boucliers influencent directement votre équipement et vos statistiques.
            </p>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="grid gap-1 text-xs font-semibold">
              <span>
                Nom de l&apos;objet <span className="text-red-500">*</span>
              </span>
              <input placeholder="Ex: Cotte de mailles, Rapière..." value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} className="rounded border bg-transparent px-3 py-1.5 text-sm font-normal" style={{ borderColor: "var(--dnd-accent-soft)" }} />
              <span className="font-normal text-[11px]" style={{ color: "var(--dnd-muted)" }}>
                Nom affiché dans votre sac d&apos;aventurier.
              </span>
            </label>

            <label className="grid gap-1 text-xs font-semibold">
              <span>Type d&apos;objet mécanique</span>
              <select value={newItem.type} onChange={(e) => setNewItem({ ...newItem, type: e.target.value })} className="rounded border bg-transparent px-3 py-1.5 text-sm font-normal" style={{ borderColor: "var(--dnd-accent-soft)" }}>
                <option value="GEAR">Équipement général / Objet divers</option>
                <option value="WEAPON">Arme (corps à corps / distance)</option>
                <option value="ARMOR">Armure (base de protection)</option>
                <option value="SHIELD">Bouclier (+2 CA par défaut)</option>
                <option value="TOOL">Outil d&apos;artisan / Kit</option>
                <option value="CONSUMABLE">Consommable (potion, parchemin)</option>
              </select>
              <span className="font-normal text-[11px]" style={{ color: "var(--dnd-muted)" }}>
                Détermine si l&apos;objet peut être équipé sur la fiche.
              </span>
            </label>

            <label className="grid gap-1 text-xs font-semibold">
              <span>Catégorie / Emplacement</span>
              <input placeholder="Ex: Arme courante, Armure lourde, Trésor..." value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })} className="rounded border bg-transparent px-3 py-1.5 text-sm font-normal" style={{ borderColor: "var(--dnd-accent-soft)" }} />
              <span className="font-normal text-[11px]" style={{ color: "var(--dnd-muted)" }}>
                Sous-type informatif ou classification D&D.
              </span>
            </label>

            <label className="grid gap-1 text-xs font-semibold">
              <span>Quantité possédée</span>
              <input type="number" min="1" value={newItem.quantity} onChange={(e) => setNewItem({ ...newItem, quantity: Math.max(1, Number(e.target.value)) })} className="rounded border bg-transparent px-3 py-1.5 text-sm font-normal" style={{ borderColor: "var(--dnd-accent-soft)" }} />
              <span className="font-normal text-[11px]" style={{ color: "var(--dnd-muted)" }}>
                Nombre d&apos;exemplaires dans votre paquetage.
              </span>
            </label>

            <label className="grid gap-1 text-xs font-semibold">
              <span>Poids unitaire (en livres / lb)</span>
              <input type="number" step="0.1" min="0" placeholder="0" value={newItem.weightLb} onChange={(e) => setNewItem({ ...newItem, weightLb: Math.max(0, Number(e.target.value)) })} className="rounded border bg-transparent px-3 py-1.5 text-sm font-normal" style={{ borderColor: "var(--dnd-accent-soft)" }} />
              <span className="font-normal text-[11px]" style={{ color: "var(--dnd-muted)" }}>
                Sert au calcul de l&apos;encombrement total porté.
              </span>
            </label>

            <label className="grid gap-1 text-xs font-semibold">
              <span>Valeur marchande (en Pièces d&apos;Or / PO)</span>
              <input type="number" step="0.1" min="0" placeholder="0" value={newItem.costGp} onChange={(e) => setNewItem({ ...newItem, costGp: Math.max(0, Number(e.target.value)) })} className="rounded border bg-transparent px-3 py-1.5 text-sm font-normal" style={{ borderColor: "var(--dnd-accent-soft)" }} />
              <span className="font-normal text-[11px]" style={{ color: "var(--dnd-muted)" }}>
                Valeur standard pour la revente ou le troc.
              </span>
            </label>

            {(newItem.type === "ARMOR" || newItem.type === "SHIELD") && (
              <label className="grid gap-1 text-xs font-semibold sm:col-span-2 lg:col-span-3">
                <span>{newItem.type === "ARMOR" ? "Classe d'Armure (CA de base fournie par l'armure)" : "Bonus de Classe d'Armure (généralement +2 pour un bouclier)"}</span>
                <input type="number" min="0" max="30" placeholder={newItem.type === "ARMOR" ? "Ex: 14 (chemise de mailles), 18 (harnois)" : "Ex: 2"} value={newItem.armorClass || ""} onChange={(e) => setNewItem({ ...newItem, armorClass: Number(e.target.value) })} className="rounded border bg-transparent px-3 py-1.5 text-sm font-normal" style={{ borderColor: "var(--dnd-accent)" }} />
                <span className="font-normal text-[11px]" style={{ color: "var(--dnd-muted)" }}>
                  {newItem.type === "ARMOR" ? "Définit la valeur de CA appliquée lorsque vous cliquez sur 'Équiper'." : "S'ajoute à votre CA totale lorsque le bouclier est équipé."}
                </span>
              </label>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between border-t pt-3" style={{ borderColor: "var(--dnd-accent-soft)" }}>
            <span className="text-xs" style={{ color: "var(--dnd-muted)" }}>
              L&apos;objet sera ajouté à la liste ci-dessous, prêt à être équipé ou sauvegardé.
            </span>
            <button type="button" onClick={handleAddItem} className="rounded px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90" style={{ background: "var(--dnd-accent)" }}>
              + Enregistrer cet objet dans l&apos;inventaire
            </button>
          </div>
        </div>
      )}

      <h3 className="mt-5 font-semibold">Objets possédés</h3>
      <ul className="mt-3 space-y-2 text-sm">
        {activeInventory.map((entry) => {
          const canEquip = entry.item.type === "ARMOR" || entry.item.type === "SHIELD";
          return (
            <li key={entry.id} className="flex flex-wrap items-center justify-between gap-2 rounded border p-2" style={{ borderColor: "var(--dnd-accent-soft)" }}>
              <span>
                {entry.item.name}{" "}
                <span style={{ color: "var(--dnd-muted)" }}>
                  · {entry.item.category} · x{entry.quantity}
                  {entry.item.weightLb ? ` · ${entry.item.weightLb} lb` : ""}
                </span>
              </span>
              <div className="flex items-center gap-2">
                {canEquip && onToggleEquip && !editing && (
                  <button type="button" disabled={equipPendingId === entry.id} onClick={() => handleToggleEquip(entry.id)} className="rounded border px-3 py-1 text-xs font-semibold disabled:opacity-50" style={{ borderColor: "var(--dnd-accent)", background: entry.isEquipped ? "var(--dnd-accent)" : "transparent", color: entry.isEquipped ? "#fff" : "var(--dnd-ink)" }}>
                    {equipPendingId === entry.id ? "..." : entry.isEquipped ? "Déséquiper" : "Équiper"}
                  </button>
                )}
                {editing && (
                  <button type="button" onClick={() => handleRemoveItem(entry.id)} className="text-xs text-red-600 hover:underline">
                    Supprimer
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
