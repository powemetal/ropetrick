"use client";

import React from "react";
import type { CharacterInventoryEntry } from "@/modules/characters/components/sheet/shared";
import { calculateWeaponStats } from "@/modules/characters/engine/dnd-rules-engine";

type EquipmentMannequinProps = {
  activeInventory: CharacterInventoryEntry[];
  onToggleEquip: (id: string) => void;
  onRollItem?: (item: CharacterInventoryEntry) => void;
  strengthMod?: number;
  dexterityMod?: number;
  level?: number;
};

export function EquipmentMannequin({
  activeInventory,
  onToggleEquip,
  onRollItem,
  strengthMod,
  dexterityMod,
  level,
}: EquipmentMannequinProps) {
  // Valeurs de secours par défaut si non fournies (Force 18 ➔ +4, Niveau 1 ➔ Maîtrise +2)
  const resolvedStrengthMod = strengthMod !== undefined ? strengthMod : 4;
  const resolvedDexterityMod = dexterityMod !== undefined ? dexterityMod : 0;
  const resolvedLevel = level !== undefined ? level : 1;

  // Filtrer uniquement les objets équipés
  const equippedItems = activeInventory.filter((entry) => entry.isEquipped);

  // Catégorisation pour le mannequin
  const armor = equippedItems.find((e) => e.item?.type === "ARMOR");
  const shield = equippedItems.find((e) => e.item?.type === "SHIELD");
  const weapons = equippedItems.filter((e) => e.item?.type === "WEAPON" || e.item?.type === "WEOAPON");
  const magicalAttuned = activeInventory.filter((e) => Boolean((e as any).isAttuned || (e.item as any)?.attuned));

  return (
    <div 
      className="rounded-xl border p-6 space-y-6 shadow-md transition-all"
      style={{ borderColor: "var(--dnd-accent-soft)", background: "var(--dnd-surface)" }}
    >
      {/* En-titre stylé */}
      <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: "var(--dnd-accent-soft)" }}>
        <div>
          <h3 className="text-base font-extrabold uppercase tracking-widest text-[var(--dnd-ink)] flex items-center gap-2">
            <span>🛡️</span> Mannequin d&apos;Équipement & Attunement
          </h3>
          <p className="text-xs text-[var(--dnd-muted)]">
            Représentation schématique de votre barda actif et de vos résonances magiques.
          </p>
        </div>
        <div className="text-right hidden sm:block">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full border bg-amber-500/10 text-amber-600 border-amber-500/30">
            ⚡ Harmonisation : {magicalAttuned.length} / 3
          </span>
        </div>
      </div>

      {/* Grille silhouette / Mannequin de slots */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Slot 1 : Armure / Torse */}
        <div 
          className="relative rounded-lg border-2 border-dashed p-4 flex flex-col justify-between transition-all hover:shadow-inner"
          style={{ borderColor: armor ? "var(--dnd-accent)" : "var(--dnd-accent-soft)", background: "rgba(0,0,0,0.01)" }}
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] uppercase font-black tracking-wider text-[var(--dnd-muted)]">👕 Torse & Armure</span>
            <span className="text-lg">🛡️</span>
          </div>

          <div className="my-2">
            {armor ? (
              <div className="space-y-1">
                <p className="font-bold text-sm text-[var(--dnd-ink)] leading-snug">{armor.item.name}</p>
                <div className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-[var(--dnd-accent-soft)] text-[var(--dnd-ink)]">
                  CA de base : {armor.item.armorClass ?? "N/C"}
                </div>
              </div>
            ) : (
              <div className="py-3 text-center">
                <p className="text-xs italic text-[var(--dnd-muted)]">Aucune armure revêtue</p>
              </div>
            )}
          </div>

          {armor && (
            <button
              type="button"
              onClick={() => onToggleEquip(armor.id)}
              className="mt-2 text-xs font-semibold text-rose-500 hover:text-rose-700 transition-colors text-left flex items-center gap-1"
            >
              <span>✕</span> Retirer l&apos;armure
            </button>
          )}
        </div>

        {/* Slot 2 : Main secondaire / Bouclier */}
        <div 
          className="relative rounded-lg border-2 border-dashed p-4 flex flex-col justify-between transition-all hover:shadow-inner"
          style={{ borderColor: shield ? "var(--dnd-accent)" : "var(--dnd-accent-soft)", background: "rgba(0,0,0,0.01)" }}
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] uppercase font-black tracking-wider text-[var(--dnd-muted)]">🦾 Main Secondaire</span>
            <span className="text-lg">🛡️</span>
          </div>

          <div className="my-2">
            {shield ? (
              <div className="space-y-1">
                <p className="font-bold text-sm text-[var(--dnd-ink)] leading-snug">{shield.item.name}</p>
                <div className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-[var(--dnd-accent-soft)] text-[var(--dnd-ink)]">
                  Bonus CA : +{shield.item.armorClass ?? 2}
                </div>
              </div>
            ) : (
              <div className="py-3 text-center">
                <p className="text-xs italic text-[var(--dnd-muted)]">Main libre / Aucun bouclier</p>
              </div>
            )}
          </div>

          {shield && (
            <button
              type="button"
              onClick={() => onToggleEquip(shield.id)}
              className="mt-2 text-xs font-semibold text-rose-500 hover:text-rose-700 transition-colors text-left flex items-center gap-1"
            >
              <span>✕</span> Retirer le bouclier
            </button>
          )}
        </div>

        {/* Slot 3 : Objets magiques liés (Attunement Slots) */}
        <div 
          className="relative rounded-lg border-2 border-dashed p-4 flex flex-col justify-between transition-all hover:shadow-inner"
          style={{ borderColor: magicalAttuned.length > 0 ? "var(--dnd-accent)" : "var(--dnd-accent-soft)", background: "rgba(0,0,0,0.01)" }}
        >
          <div className="flex justify-between items-start mb-1">
            <span className="text-[10px] uppercase font-black tracking-wider text-[var(--dnd-muted)]">✨ Harmonisation (3 max)</span>
            <span className="text-lg">🔮</span>
          </div>

          <div className="my-1 space-y-1.5 flex-1 overflow-y-auto max-h-24">
            {magicalAttuned.length === 0 ? (
              <div className="py-3 text-center">
                <p className="text-xs italic text-[var(--dnd-muted)]">Aucun objet lié activement</p>
              </div>
            ) : (
              magicalAttuned.map((item) => (
                <div key={item.id} className="text-xs flex justify-between items-center bg-black/5 dark:bg-white/5 px-2 py-1 rounded">
                  <span className="font-bold truncate text-[var(--dnd-ink)] max-w-[120px]" title={item.item.name}>
                    {item.item.name}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 font-extrabold uppercase">
                    ⚡ Lié
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="mt-2 pt-2 border-t flex justify-between items-center text-[10px] text-[var(--dnd-muted)]" style={{ borderColor: "var(--dnd-accent-soft)" }}>
            <span>Capacité utilisée</span>
            <span className="font-bold text-[var(--dnd-ink)]">{magicalAttuned.length} / 3 slots</span>
          </div>
        </div>

      </div>

      {/* Section Armes prêtes au combat */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-black uppercase tracking-wider text-[var(--dnd-ink)] flex items-center gap-2">
          <span>⚔️</span> Armes Prêtes au Combat & Jets de Dégâts
        </h4>

        {weapons.length === 0 ? (
          <div className="rounded border border-dashed p-4 text-center" style={{ borderColor: "var(--dnd-accent-soft)" }}>
            <p className="text-xs italic text-[var(--dnd-muted)]">Aucune arme équipée pour le moment. Cochez &quot;Équipé&quot; dans votre inventaire pour l&apos;afficher ici.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {weapons.map((weapon) => {
              // Calcul dynamique via le moteur de règles D&D avec les valeurs résolues
              const stats = calculateWeaponStats({
                weapon,
                strengthModifier: resolvedStrengthMod,
                dexterityModifier: resolvedDexterityMod,
                level: resolvedLevel,
              });

              return (
                <div 
                  key={weapon.id}
                  className="rounded-lg border p-3 flex flex-col justify-between transition-all hover:shadow-sm space-y-2"
                  style={{ borderColor: "var(--dnd-accent-soft)", background: "var(--dnd-surface)" }}
                >
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-sm text-[var(--dnd-ink)]">{weapon.item.name}</h5>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {onRollItem && (
                        <button
                          type="button"
                          onClick={() => onRollItem(weapon)}
                          className="rounded px-3 py-1.5 text-xs font-bold text-white shadow transition-transform active:scale-95 flex items-center gap-1"
                          style={{ background: "var(--dnd-accent)" }}
                          title="Lancer les dés pour cette arme"
                        >
                          <span>🎲</span> Rouler
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onToggleEquip(weapon.id)}
                        className="rounded border px-2.5 py-1.5 text-xs font-semibold text-[var(--dnd-ink)] hover:bg-black/5 transition-colors"
                        style={{ borderColor: "var(--dnd-accent-soft)" }}
                        title="Ranger l'arme"
                      >
                        Ranger
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--dnd-muted)]">
                    <span className="font-semibold text-[var(--dnd-ink)]">Atq: {stats.attackBonus}</span>
                    <span>•</span>
                    <span>Dégâts :</span> 
                    <span className="font-mono font-bold text-[var(--dnd-ink)] bg-black/5 dark:bg-white/5 px-1 rounded">
                      {stats.damageFormula}
                    </span> 
                    {stats.damageType && <span className="text-[10px] uppercase">({stats.damageType})</span>}
                  </div>

                  {/* Affichage détaillé du calcul de l'attaque pour les joueurs */}
                  <div className="text-[11px] italic text-[var(--dnd-muted)] bg-black/5 dark:bg-white/5 px-2 py-1 rounded">
                    💡 Détail : {stats.breakdown}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}