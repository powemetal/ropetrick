"use client";

import { useEffect, useState } from "react";
import { DND_THEMES } from "@/styles/dnd-themes";
import { useTheme, themeTokensKey, type GlobalThemeKey } from "@/styles/theme-provider";

const options: { value: GlobalThemeKey; label: string }[] = [
  { value: "light-parchment", label: "Parchemin officiel" },
  { value: "dark-dungeon", label: "Donjon sombre" },
  ...Object.entries(DND_THEMES)
    .filter(([key]) => key !== "light" && key !== "dark")
    .map(([value, theme]) => ({ value: value as GlobalThemeKey, label: theme.label })),
];

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Pendant le SSR et avant hydratation, on rend un squelette visuel neutre
  if (!mounted) {
    return (
      <div className="flex h-7 items-center gap-2 text-xs opacity-0" aria-hidden="true">
        <span className="size-3 rounded-full" />
        <div className="h-7 w-28 rounded border" />
      </div>
    );
  }

  const tokens = DND_THEMES[themeTokensKey(theme)];

  return (
    <label className="flex items-center gap-2 text-xs" style={{ color: "var(--theme-muted)" }}>
      <span className="sr-only">Thème global</span>
      <span
        aria-hidden="true"
        className="size-3 rounded-full"
        style={{ background: tokens?.accent ?? "var(--theme-accent)" }}
      />
      <select
        value={theme}
        onChange={(event) => setTheme(event.target.value as GlobalThemeKey)}
        className="max-w-32 rounded border bg-transparent px-2 py-1.5"
        style={{ borderColor: "var(--theme-accent-soft)", color: "var(--theme-ink)" }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} style={{ background: "#18181b", color: "#fff" }}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}