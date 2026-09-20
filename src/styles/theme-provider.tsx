"use client";

import { createContext, useContext, useLayoutEffect, useState } from "react";
import { DND_THEMES, type DndThemeKey } from "@/styles/dnd-themes";

export type GlobalThemeKey = "light-parchment" | "dark-dungeon" | Exclude<DndThemeKey, "light" | "dark">;

type ThemeContextValue = { theme: GlobalThemeKey; setTheme: (theme: GlobalThemeKey) => void };
const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = "rope-trick-theme";
const THEME_CLASS_NAMES = [...Object.keys(DND_THEMES), "light-parchment", "dark-dungeon"];

export function applyThemeToDocument(theme: GlobalThemeKey) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const tokens = DND_THEMES[themeTokensKey(theme)];

  for (const className of THEME_CLASS_NAMES) {
    root.classList.remove(className);
  }

  root.dataset.theme = theme;
  root.classList.add(theme);

  for (const [name, value] of Object.entries({
    accent: tokens.accent,
    accentSoft: tokens.accentSoft,
    background: tokens.background,
    surface: tokens.surface,
    ink: tokens.ink,
    muted: tokens.muted,
  })) {
    root.style.setProperty(`--theme-${name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`, value);
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Ignore storage errors in private mode or restricted environments.
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<GlobalThemeKey>(() => {
    if (typeof window === "undefined") return "dark-dungeon";

    const stored = window.localStorage.getItem(STORAGE_KEY) as GlobalThemeKey | null;
    return stored && isGlobalTheme(stored) ? stored : "dark-dungeon";
  });

  useLayoutEffect(() => {
    applyThemeToDocument(theme);
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, setTheme: setThemeState }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
}

export function themeTokensKey(theme: GlobalThemeKey): DndThemeKey {
  if (theme === "light-parchment") return "light";
  if (theme === "dark-dungeon") return "dark";
  return theme;
}

export function isGlobalTheme(value: string): value is GlobalThemeKey {
  return value === "light-parchment" || value === "dark-dungeon" || Object.hasOwn(DND_THEMES, value);
}
