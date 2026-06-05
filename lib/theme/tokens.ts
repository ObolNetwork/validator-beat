/**
 * Pizza SVG colors — keep in sync with styles/theme-tokens.css (--theme-risk-*).
 * Non-developers should edit theme-tokens.css only; update these if you change pizza colors.
 */
import type { SliceColor } from "@lib/rubric/types";

export const THEME_BRAND = "#16968e";

export const PIZZA_FILL: Record<SliceColor, string> = {
  green: "#1f9b6b",
  yellow: "#e7c300",
  red: "#bb1122",
};

export const PIZZA_RING: Record<SliceColor, string> = {
  green: "#82edcc",
  yellow: "#ffe566",
  red: "#e85c6f",
};

export const PIZZA_PLATE = "#ffffff";
export const PIZZA_EMPTY = "#f0f0f0";
export const PIZZA_EMPTY_STROKE = "#cccccc";
export const PIZZA_INK = "#000000";

export const CONFETTI_BRAND = [
  THEME_BRAND,
  "#2fe4ab",
  PIZZA_FILL.green,
  PIZZA_FILL.yellow,
  "#ffffff",
];
