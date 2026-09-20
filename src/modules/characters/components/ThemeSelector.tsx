"use client";

import { DND_THEMES, type DndThemeKey } from "@/styles/dnd-themes";

type ThemeSelectorProps = { value: DndThemeKey; onChange: (theme: DndThemeKey) => void };

export function ThemeSelector({ value, onChange }: ThemeSelectorProps) {
  return (
    <label className="grid gap-2 text-sm" style={{ color: "var(--dnd-muted)" }}>
      Thème de la feuille
      <select value={value} onChange={(event) => onChange(event.target.value as DndThemeKey)} className="rounded-md border bg-transparent px-3 py-2" style={{ borderColor: "var(--dnd-accent-soft)", color: "var(--dnd-ink)" }}>
        {Object.entries(DND_THEMES).map(([key, theme]) => (
          <option key={key} value={key} style={{ background: "#18181b", color: "#fff" }}>
            {theme.label}
          </option>
        ))}
      </select>
    </label>
  );
}
