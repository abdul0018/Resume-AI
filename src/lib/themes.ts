import type { CSSProperties } from "react";
import type { TemplateId } from "@shared/schema";

export interface Theme {
  id: TemplateId;
  /** Swatch colors for pickers */
  swatch: [string, string, string];
  /** Gatefold doors (outside of the card) */
  door: {
    paper: string;
    paper2: string;
    lining: string;
    crease: string;
    creaseLight: string;
    ink: string;
    /** "press" = letterpress on light paper, "foil" = metallic foil on dark paper */
    finish: "press" | "foil";
  };
  /** Satin ribbon gradient stops, dark → light */
  ribbon: [string, string, string, string, string];
  pocket: string;
  /** Inner card (revealed after opening) */
  inner: { bg: string; ink: string; accent: string; muted: string };
  /** Long-scroll invitation page */
  page: { bg: string; surface: string; ink: string; muted: string; accent: string; line: string; onAccent: string };
  nameFont: "script" | "serif";
  dark?: boolean;
}

const GOLD: Theme["ribbon"] = ["#8a6a2c", "#c9a75e", "#f6e7b8", "#b48f48", "#e6cf93"];

export const THEMES: Record<TemplateId, Theme> = {
  rishton: {
    id: "rishton",
    swatch: ["#f3ecdf", "#c7ccd4", "#2a4a9c"],
    door: {
      paper: "#f4eee2",
      paper2: "#ebe3d3",
      lining: "#efe8db",
      crease: "rgba(110, 92, 62, 0.20)",
      creaseLight: "rgba(255, 255, 255, 0.75)",
      ink: "#a39887",
      finish: "press",
    },
    ribbon: ["#8b9097", "#c9cdd3", "#fbfcfd", "#a9aeb5", "#e3e6ea"],
    pocket: "#efe7d8",
    inner: { bg: "#fbf9f4", ink: "#1e3672", accent: "#2b4c9e", muted: "#5b6c93" },
    page: { bg: "#f8f5ef", surface: "#ffffff", ink: "#1b2847", muted: "#5d6782", accent: "#2b4c9e", line: "rgba(43,76,158,.16)", onAccent: "#fff" },
    nameFont: "script",
  },
  zumrad: {
    id: "zumrad",
    swatch: ["#0f4a3c", "#c9a85c", "#f7f1e3"],
    door: {
      paper: "#11503f",
      paper2: "#0b3a2f",
      lining: "#f3ecdc",
      crease: "rgba(0, 0, 0, 0.28)",
      creaseLight: "rgba(214, 186, 116, 0.28)",
      ink: "#d4b46a",
      finish: "foil",
    },
    ribbon: GOLD,
    pocket: "#0e4537",
    inner: { bg: "#f7f1e3", ink: "#0f4a3c", accent: "#a98436", muted: "#4f6e63" },
    page: { bg: "#f6f1e6", surface: "#fffdf8", ink: "#103d32", muted: "#56706a", accent: "#0f4a3c", line: "rgba(169,132,54,.28)", onAccent: "#f6e7b8" },
    nameFont: "script",
  },
  atlas: {
    id: "atlas",
    swatch: ["#efe4d6", "#b0475e", "#2f3f7a"],
    door: {
      paper: "#f1e7da",
      paper2: "#e7d9c6",
      lining: "#f4ece1",
      crease: "rgba(120, 80, 60, 0.18)",
      creaseLight: "rgba(255, 255, 255, 0.7)",
      ink: "#a8877f",
      finish: "press",
    },
    ribbon: ["#bba98f", "#e3d6c2", "#fffaf1", "#cdbca3", "#eee3d2"],
    pocket: "#ece0cf",
    inner: { bg: "#fbf6ee", ink: "#5a2238", accent: "#b0475e", muted: "#7d5a66" },
    page: { bg: "#faf5ee", surface: "#ffffff", ink: "#3d1d2a", muted: "#7a6068", accent: "#a63f57", line: "rgba(166,63,87,.18)", onAccent: "#fff" },
    nameFont: "script",
  },
  suzani: {
    id: "suzani",
    swatch: ["#eadfcc", "#7c1d2a", "#a8452f"],
    door: {
      paper: "#ece2d0",
      paper2: "#e0d2ba",
      lining: "#efe6d6",
      crease: "rgba(110, 70, 40, 0.20)",
      creaseLight: "rgba(255, 252, 245, 0.7)",
      ink: "#a2826a",
      finish: "press",
    },
    ribbon: ["#4a0f19", "#7e2230", "#b5525d", "#5f1622", "#8f2c3a"],
    pocket: "#e6d9c3",
    inner: { bg: "#f5eddf", ink: "#6b1f24", accent: "#a8452f", muted: "#7d5c4c" },
    page: { bg: "#f6efe3", surface: "#fffcf6", ink: "#4a1a1d", muted: "#7b6155", accent: "#8f2a30", line: "rgba(143,42,48,.18)", onAccent: "#fff" },
    nameFont: "script",
  },
  oqoltin: {
    id: "oqoltin",
    swatch: ["#fbfaf7", "#111111", "#b8964f"],
    door: {
      paper: "#fcfbf8",
      paper2: "#f1efe9",
      lining: "#faf9f5",
      crease: "rgba(0, 0, 0, 0.12)",
      creaseLight: "rgba(255, 255, 255, 0.9)",
      ink: "#9c9a94",
      finish: "press",
    },
    ribbon: ["#050506", "#26262a", "#6c6c73", "#141416", "#36363b"],
    pocket: "#f3f1ec",
    inner: { bg: "#ffffff", ink: "#141414", accent: "#b08d45", muted: "#6d6a63" },
    page: { bg: "#fbfaf8", surface: "#ffffff", ink: "#121212", muted: "#6b6863", accent: "#121212", line: "rgba(176,141,69,.35)", onAccent: "#fff" },
    nameFont: "serif",
  },
  samarqand: {
    id: "samarqand",
    swatch: ["#17223a", "#c9a85c", "#2f4a7e"],
    door: {
      paper: "#1d2a46",
      paper2: "#131c31",
      lining: "#1a2540",
      crease: "rgba(0, 0, 0, 0.35)",
      creaseLight: "rgba(201, 168, 92, 0.22)",
      ink: "#d6b86f",
      finish: "foil",
    },
    ribbon: GOLD,
    pocket: "#141d32",
    inner: { bg: "#17223a", ink: "#f1e3bb", accent: "#d2b265", muted: "#a9a68f" },
    page: { bg: "#0f1729", surface: "#16213a", ink: "#f2e8cd", muted: "#a7a99f", accent: "#d2b265", line: "rgba(210,178,101,.25)", onAccent: "#10172a" },
    nameFont: "serif",
    dark: true,
  },
};

export const getTheme = (id: string): Theme => THEMES[id as TemplateId] ?? THEMES.rishton;

/** CSS custom properties consumed by gatefold.css and the invitation page. */
export function themeVars(t: Theme): CSSProperties {
  return {
    "--paper": t.door.paper,
    "--paper2": t.door.paper2,
    "--lining": t.door.lining,
    "--crease": t.door.crease,
    "--crease-light": t.door.creaseLight,
    "--door-ink": t.door.ink,
    "--rb1": t.ribbon[0],
    "--rb2": t.ribbon[1],
    "--rb3": t.ribbon[2],
    "--rb4": t.ribbon[3],
    "--rb5": t.ribbon[4],
    "--pocket": t.pocket,
    "--in-bg": t.inner.bg,
    "--in-ink": t.inner.ink,
    "--in-accent": t.inner.accent,
    "--in-muted": t.inner.muted,
    "--pg-bg": t.page.bg,
    "--pg-surface": t.page.surface,
    "--pg-ink": t.page.ink,
    "--pg-muted": t.page.muted,
    "--pg-accent": t.page.accent,
    "--pg-line": t.page.line,
    "--pg-on-accent": t.page.onAccent,
  } as CSSProperties;
}
