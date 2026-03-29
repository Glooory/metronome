import "./styles/themes/aurora.css";
import "./styles/themes/blueprint.css";
import "./styles/themes/brutalism.css";
import "./styles/themes/clay.css";
import "./styles/themes/cyberpunk.css";
import "./styles/themes/disco.css";
import "./styles/themes/e-ink.css";
import "./styles/themes/kids.css";
import "./styles/themes/mechanical.css";
import "./styles/themes/oled.css";
import "./styles/themes/sketch.css";
import "./styles/themes/soft.css";
import "./styles/themes/swiss.css";
import "./styles/themes/terminal.css";
import "./styles/themes/wood.css";
import "./styles/themes/zen.css";

export const THEME_REGISTRY = [
  { id: "aurora", className: "theme-aurora" },
  { id: "blueprint", className: "theme-blueprint" },
  { id: "brutalism", className: "theme-brutalism" },
  { id: "clay", className: "theme-clay" },
  { id: "cyberpunk", className: "theme-cyberpunk" },
  { id: "disco", className: "theme-disco" },
  { id: "e-ink", className: "theme-e-ink" },
  { id: "kids", className: "theme-kids" },
  { id: "mechanical", className: "theme-mechanical" },
  { id: "oled", className: "theme-oled" },
  { id: "sketch", className: "theme-sketch" },
  { id: "soft", className: "theme-soft" },
  { id: "swiss", className: "theme-swiss" },
  { id: "terminal", className: "theme-terminal" },
  { id: "wood", className: "theme-wood" },
  { id: "zen", className: "theme-zen" },
] as const;

export type Theme = (typeof THEME_REGISTRY)[number]["id"];

export const DEFAULT_THEME: Theme = "oled";

export const THEME_IDS: Theme[] = THEME_REGISTRY.map(({ id }) => id);

export const isTheme = (value: string): value is Theme =>
  THEME_REGISTRY.some((theme) => theme.id === value);

export const getThemeClassName = (theme: Theme) =>
  THEME_REGISTRY.find((entry) => entry.id === theme)?.className ?? `theme-${theme}`;
