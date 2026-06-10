/**
 * Pizza SVG colors — keep in sync with styles/theme-tokens.css (--theme-risk-*).
 * Non-developers should edit theme-tokens.css only; update these if you change pizza colors.
 */
import type { SliceColor } from "@lib/rubric/types";

export const THEME_BRAND = "#2c7a64";

export const PIZZA_FILL: Record<SliceColor, string> = {
  green: "#3a9e80",
  yellow: "#cf9a3a",
  red: "#c46044",
};

export const PIZZA_RING: Record<SliceColor, string> = {
  green: "#1f7a5e",
  yellow: "#a8761f",
  red: "#a64428",
};

export const PIZZA_PLATE = "#fffdf7";
export const PIZZA_EMPTY = "#e9e5d8";
export const PIZZA_EMPTY_STROKE = "#d2cbb8";
export const PIZZA_INK = "#0e1b1d";

export const CONFETTI_BRAND = [
  THEME_BRAND,
  "#2fe4ab",
  PIZZA_FILL.green,
  PIZZA_FILL.yellow,
  "#ffffff",
];
