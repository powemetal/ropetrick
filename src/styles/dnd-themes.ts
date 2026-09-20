export const DND_THEMES = {
  light: { label: "Parchemin", accent: "#8b5a2b", accentSoft: "#ead9bd", background: "#f5efe6", surface: "#fffaf0", ink: "#2b1d0c", muted: "#725d43" },
  dark: { label: "Obsidienne", accent: "#f5c451", accentSoft: "#4b3a18", background: "#111113", surface: "#1d1d20", ink: "#f8f3e7", muted: "#b9ae9d" },
  barbarian: { label: "Barbare", accent: "#b91c1c", accentSoft: "#451616", background: "#1b1010", surface: "#2a1717", ink: "#fff1f0", muted: "#d9aaa6" },
  bard: { label: "Barde", accent: "#9333ea", accentSoft: "#3c1d5d", background: "#17101e", surface: "#261531", ink: "#fff7ff", muted: "#d4b9dd" },
  cleric: { label: "Clerc", accent: "#eab308", accentSoft: "#4d3b08", background: "#1b180d", surface: "#2b260f", ink: "#fffbed", muted: "#d9cf9e" },
  druid: { label: "Druide", accent: "#15803d", accentSoft: "#123b25", background: "#0d1812", surface: "#14291c", ink: "#f1fff5", muted: "#a6c5ae" },
  fighter: { label: "Guerrier", accent: "#a1a1aa", accentSoft: "#34343a", background: "#141416", surface: "#222226", ink: "#f8f8fa", muted: "#b9b9c3" },
  monk: { label: "Moine", accent: "#0ea5e9", accentSoft: "#123c53", background: "#0b161d", surface: "#10232e", ink: "#effaff", muted: "#a5c5d5" },
  paladin: { label: "Paladin", accent: "#f59e0b", accentSoft: "#4d3009", background: "#18130b", surface: "#2a200e", ink: "#fff9eb", muted: "#d9c39a" },
  ranger: { label: "Rôdeur", accent: "#166534", accentSoft: "#123a25", background: "#0d1711", surface: "#14281b", ink: "#f1fff5", muted: "#abc5ae" },
  rogue: { label: "Roublard", accent: "#a855f7", accentSoft: "#321e4d", background: "#121116", surface: "#211a28", ink: "#fcf7ff", muted: "#c1b2ca" },
  sorcerer: { label: "Ensorceleur", accent: "#ec4899", accentSoft: "#4e1737", background: "#1c0e17", surface: "#2c1424", ink: "#fff3fa", muted: "#d7acbf" },
  warlock: { label: "Occultiste", accent: "#6b21a8", accentSoft: "#32134b", background: "#120d18", surface: "#211329", ink: "#f9f2ff", muted: "#c2a8d0" },
  wizard: { label: "Magicien", accent: "#1d4ed8", accentSoft: "#142e6c", background: "#0c1426", surface: "#112044", ink: "#f1f6ff", muted: "#a7b9d8" },
  artificer: { label: "Artificier", accent: "#ca8a04", accentSoft: "#493208", background: "#18140b", surface: "#29210d", ink: "#fff9e9", muted: "#d2bf91" },
} as const;

export type DndThemeKey = keyof typeof DND_THEMES;
export type DndThemeTokens = (typeof DND_THEMES)[DndThemeKey];

export function themeStyle(theme: DndThemeKey): React.CSSProperties {
  const tokens = DND_THEMES[theme];
  return {
    "--dnd-accent": tokens.accent,
    "--dnd-accent-soft": tokens.accentSoft,
    "--dnd-background": tokens.background,
    "--dnd-surface": tokens.surface,
    "--dnd-ink": tokens.ink,
    "--dnd-muted": tokens.muted,
  } as React.CSSProperties;
}
