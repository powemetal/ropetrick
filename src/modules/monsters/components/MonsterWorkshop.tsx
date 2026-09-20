"use client";

import { useState, useTransition } from "react";
import { challengeRatings, monsterCrSuggestion } from "@/modules/monsters/engine/monster-cr-rules";

type WorkshopProps = { onCreate: (data: Record<string, unknown>) => Promise<void> };

export function MonsterWorkshop({ onCreate }: WorkshopProps) {
  const [name, setName] = useState("");
  const [cr, setCr] = useState("1");
  const [legendary, setLegendary] = useState(false);
  const [pending, startTransition] = useTransition();
  const suggestion = monsterCrSuggestion(cr);
  const submit = () => startTransition(() => onCreate({ name, creatureType: "Monstrosité", challengeRating: cr, armorClass: suggestion.armorClass, hitPoints: Math.round((suggestion.hitPoints.min + suggestion.hitPoints.max) / 2), hitDice: null, isLegendary: legendary, legendaryResistances: legendary ? 3 : 0, traits: [{ name: "Présence menaçante", description: "Les créatures proches ressentent la puissance de ce monstre." }], actions: [{ name: "Attaque", description: `Attaque au corps à corps: +${suggestion.attackBonus} pour toucher; dégâts moyens ${suggestion.damagePerRound.min}-${suggestion.damagePerRound.max}.` }], legendaryActions: legendary ? [{ name: "Déplacement", description: "Le monstre se déplace sans provoquer d'attaque d'opportunité." }] : [], lairActions: legendary ? [{ name: "Effet du repaire", description: "L'environnement se déchaîne à l'initiative 20." }] : [], speed: { walk: 30 } }));
  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
      <div className="border border-amber-800/30 bg-[var(--theme-surface)] p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--theme-accent)]">Atelier de création</p>
        <h1 className="mt-2 font-[var(--font-heading)] text-3xl">Forger un monstre</h1>
        <label className="mt-6 grid gap-2 text-sm">
          Nom
          <input value={name} onChange={(event) => setName(event.target.value)} className="rounded border bg-transparent px-3 py-2" placeholder="Le gardien des cendres" />
        </label>
        <label className="mt-4 grid gap-2 text-sm">
          Challenge Rating
          <select value={cr} onChange={(event) => setCr(event.target.value)} className="rounded border bg-transparent px-3 py-2">
            {challengeRatings().map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <label className="mt-4 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={legendary} onChange={(event) => setLegendary(event.target.checked)} /> Boss légendaire et actions de repaire
        </label>
        <button type="button" disabled={!name.trim() || pending} onClick={submit} className="mt-6 rounded bg-[var(--theme-accent)] px-4 py-3 font-semibold text-white disabled:opacity-50">
          {pending ? "Création..." : "Créer le monstre"}
        </button>
      </div>
      <div className="border border-amber-800/30 bg-[var(--theme-surface)] p-6">
        <h2 className="font-[var(--font-heading)] text-xl">Suggestions DMG</h2>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <Stat label="CA" value={suggestion.armorClass} />
          <Stat label="PV" value={`${suggestion.hitPoints.min}-${suggestion.hitPoints.max}`} />
          <Stat label="Attaque" value={`+${suggestion.attackBonus}`} />
          <Stat label="DD" value={suggestion.saveDc} />
          <Stat label="DPR" value={`${suggestion.damagePerRound.min}-${suggestion.damagePerRound.max}`} />
          <Stat label="PB" value={`+${suggestion.proficiencyBonus}`} />
        </dl>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded border border-[var(--theme-accent-soft)] p-3">
      <dt className="text-xs text-[var(--theme-muted)]">{label}</dt>
      <dd className="mt-1 text-lg font-semibold">{value}</dd>
    </div>
  );
}
