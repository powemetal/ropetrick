"use client";

import type { ReactNode } from "react";

export type CompendiumTooltipItem = {
  name: string;
  type?: string;
  level?: number | string;
  school?: string;
  castingTime?: string;
  range?: string;
  prerequisites?: string;
  description?: string;
};

export function CompendiumTooltip({ children, item }: { children: ReactNode; item?: CompendiumTooltipItem | null }) {
  if (!item) return <>{children}</>;

  return (
    <span className="group relative inline-flex align-middle">
      <span className="cursor-help underline decoration-dotted underline-offset-4">{children}</span>
      <span className="pointer-events-none absolute left-0 top-full z-[9999] mt-2 w-72 rounded-xl border border-[var(--dnd-accent-soft)] bg-[var(--dnd-surface)] p-3 text-left text-sm text-[var(--dnd-ink)] opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
        <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-[var(--dnd-accent)]">{item.type ?? "Compendium"}</span>
        <span className="mt-1 block text-base font-semibold">{item.name}</span>
        {(item.level || item.school || item.castingTime || item.range) && (
          <span className="mt-1 block text-[11px] text-[var(--dnd-muted)]">
            {item.level !== undefined && item.level !== null ? `Niveau ${item.level} · ` : ""}
            {item.school ?? ""}
            {item.castingTime ? ` · Temps ${item.castingTime}` : ""}
            {item.range ? ` · Portée ${item.range}` : ""}
          </span>
        )}
        {item.prerequisites && <span className="mt-2 block text-[11px] text-[var(--dnd-muted)]">Prérequis : {item.prerequisites}</span>}
        {item.description && <span className="mt-2 block leading-5 text-[var(--dnd-ink)]">{item.description}</span>}
      </span>
    </span>
  );
}
