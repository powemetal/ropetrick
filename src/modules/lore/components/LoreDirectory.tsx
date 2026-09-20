"use client";

import { useState } from "react";
import { formatCurrency } from "@/modules/lore/types/currency";

type LoreDirectoryProps = {
  locations: Array<{ id: string; name: string; description: string; isSecretDm: boolean }>;
  npcs: Array<{ id: string; name: string; race: string | null; occupation: string | null; appearance: string; isSecretDm: boolean; secretsDm?: string | null }>;
  shops: Array<{ id: string; name: string; shopType: string; location: { name: string } | null; items: Array<{ id: string; name: string; description: string; priceCp: number; rarity: string; isMagic: boolean }> }>;
};

export function LoreDirectory({ locations, npcs, shops }: LoreDirectoryProps) {
  const [activeTab, setActiveTab] = useState<"locations" | "npcs" | "shops">("locations");
  const tabs = [
    { id: "locations" as const, label: "Lieux" },
    { id: "npcs" as const, label: "PNJ" },
    { id: "shops" as const, label: "Marchés & objets" },
  ];

  return (
    <section>
      <div className="flex flex-wrap gap-2 border-b border-stone-200 pb-3" role="tablist" aria-label="Compendium">
        {tabs.map((tab) => (
          <button key={tab.id} type="button" role="tab" aria-selected={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 text-sm font-medium ${activeTab === tab.id ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"}`}>
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab === "locations" && (
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {locations.map((location) => (
            <article key={location.id} className="border border-stone-200 bg-white p-5">
              <div className="flex justify-between gap-3">
                <h2 className="font-semibold text-stone-900">{location.name}</h2>
                {location.isSecretDm && <span className="bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">Secret MJ</span>}
              </div>
              <p className="mt-3 text-sm leading-6 text-stone-600">{location.description}</p>
            </article>
          ))}
        </div>
      )}
      {activeTab === "npcs" && (
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {npcs.map((npc) => (
            <article key={npc.id} className="border border-stone-200 bg-white p-5">
              <div className="flex justify-between gap-3">
                <h2 className="font-semibold text-stone-900">{npc.name}</h2>
                {npc.isSecretDm && <span className="bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">Secret MJ</span>}
              </div>
              <p className="mt-1 text-sm text-stone-500">
                {npc.race ?? "Race inconnue"} · {npc.occupation ?? "Occupation inconnue"}
              </p>
              <p className="mt-3 text-sm leading-6 text-stone-600">{npc.appearance}</p>
              {npc.secretsDm && <p className="mt-3 border-t border-amber-100 pt-3 text-sm text-amber-900">{npc.secretsDm}</p>}
            </article>
          ))}
        </div>
      )}
      {activeTab === "shops" && (
        <div className="mt-5 space-y-5">
          {shops.map((shop) => (
            <article key={shop.id} className="border border-stone-200 bg-white p-5">
              <h2 className="font-semibold text-stone-900">{shop.name}</h2>
              <p className="text-sm text-stone-500">
                {shop.shopType}
                {shop.location ? ` · ${shop.location.name}` : ""}
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {shop.items.map((item) => (
                  <div key={item.id} className="border border-stone-100 bg-stone-50 p-3">
                    <div className="flex justify-between gap-3">
                      <p className="font-medium text-stone-900">{item.name}</p>
                      <span className="text-sm text-amber-800">{formatCurrency(item.priceCp)}</span>
                    </div>
                    <p className="mt-1 text-xs text-stone-500">
                      {item.rarity}
                      {item.isMagic ? " · Magique" : ""}
                    </p>
                    <p className="mt-2 text-sm text-stone-600">{item.description}</p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
