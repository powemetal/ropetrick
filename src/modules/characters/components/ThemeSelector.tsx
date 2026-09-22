"use client";

import { DND_THEMES, type DndThemeKey } from "@/styles/dnd-themes";

type ThemeSelectorProps = {
  value: DndThemeKey;
  onChange: (theme: DndThemeKey) => void;
};

export function ThemeSelector({ value, onChange }: ThemeSelectorProps) {
  return (
    <label
      className="flex items-center gap-2 text-xs font-semibold"
      style={{ color: "var(--dnd-muted)" }}
    >
      <span className="hidden sm:inline">Thème :</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as DndThemeKey)}
        className="rounded-lg border px-2.5 py-1.5 text-xs font-bold transition-all outline-none cursor-pointer hover:border-[var(--dnd-accent)]"
        style={{
          borderColor: "var(--dnd-accent-soft)",
          backgroundColor: "var(--dnd-surface)",
          color: "var(--dnd-ink)",
        }}
      >
        {Object.entries(DND_THEMES).map(([key, theme]) => (
          <option
            key={key}
            value={key}
            style={{
              backgroundColor: "var(--dnd-surface)",
              color: "var(--dnd-ink)",
            }}
          >
            {theme.label}
          </option>
        ))}
      </select>
    </label>
  );
}