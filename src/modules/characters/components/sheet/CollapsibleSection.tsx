"use client";

import { useId, type ReactNode } from "react";

type CollapsibleSectionProps = {
  title: string;
  isCollapsed: boolean;
  onToggle: () => void;
  children: ReactNode;
  maxHeightClass?: string;
  badge?: ReactNode;
};

export function CollapsibleSection({
  title,
  isCollapsed,
  onToggle,
  children,
  maxHeightClass = "max-h-[3000px]",
  badge,
}: CollapsibleSectionProps) {
  const contentId = useId();

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
        aria-expanded={!isCollapsed}
        aria-controls={contentId}
        className="group flex w-full items-center justify-between px-4 py-3 text-left transition-all duration-150 hover:bg-[color-mix(in_srgb,var(--dnd-accent)_15%,transparent)] active:scale-[0.99]"
      >
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-bold uppercase tracking-widest transition-colors duration-150 group-hover:brightness-125"
            style={{ color: "var(--dnd-accent)" }}
          >
            {title}
          </span>
          {badge}
        </div>

        <span
          className="text-base font-bold transition-all duration-200 group-hover:scale-125 select-none"
          style={{
            transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)",
            color: "var(--dnd-accent)",
          }}
          aria-hidden="true"
        >
          ▾
        </span>
      </button>

      <div
        id={contentId}
        className={`transition-all duration-300 ease-in-out ${
          isCollapsed
            ? "max-h-0 opacity-0 overflow-hidden pointer-events-none"
            : `${maxHeightClass} opacity-100 overflow-visible pointer-events-auto`
        }`}
      >
        <div className="p-4 pt-0">{children}</div>
      </div>
    </div>
  );
}