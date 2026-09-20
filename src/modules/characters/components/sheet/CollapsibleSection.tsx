"use client";

import { type ReactNode } from "react";

type CollapsibleSectionProps = {
  title: string;
  isCollapsed: boolean;
  onToggle: () => void;
  children: ReactNode;
  maxHeightClass?: string;
};

export function CollapsibleSection({
  title,
  isCollapsed,
  onToggle,
  children,
  maxHeightClass = "max-h-[2500px]",
}: CollapsibleSectionProps) {
  return (
    <div
      className="mt-4 overflow-hidden rounded-xl border transition-all duration-150 hover:border-[var(--dnd-accent)]"
      style={{
        borderColor: "var(--dnd-accent-soft)",
        background: "var(--dnd-surface)",
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        className="group flex w-full items-center justify-between px-4 py-3 text-left transition-all duration-150 hover:bg-[color-mix(in_srgb,var(--dnd-accent)_15%,transparent)] active:scale-[0.99]"
      >
        <span
          className="text-xs font-bold uppercase tracking-widest transition-colors duration-150 group-hover:brightness-125"
          style={{ color: "var(--dnd-accent)" }}
        >
          {title}
        </span>
        <span
          className="text-base font-bold transition-all duration-200 group-hover:scale-125"
          style={{
            transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)",
            color: "var(--dnd-accent)",
          }}
        >
          ▾
        </span>
      </button>

      <div
        className={`transition-all duration-300 ease-in-out ${
          isCollapsed ? "max-h-0 opacity-0 overflow-hidden" : `${maxHeightClass} opacity-100`
        }`}
      >
        <div className="p-4 pt-0">{children}</div>
      </div>
    </div>
  );
}