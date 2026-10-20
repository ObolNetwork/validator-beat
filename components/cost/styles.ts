import type { CSS } from "@stitches/react";

/** Layout tokens shared by the cost-of-failure sections (mirror Landing.tsx). */
export const wrap: CSS = { maxWidth: 1140, margin: "0 auto", padding: "0 28px", "@media (max-width: 480px)": { padding: "0 16px" } };
export const section: CSS = { padding: "72px 0", "@media (max-width: 760px)": { padding: "52px 0" } };
export const band: CSS = { backgroundColor: "$bg03", borderTop: "1px solid $bg05", borderBottom: "1px solid $bg05" };
export const h1: CSS = {
  fontSize: 48,
  lineHeight: 1.06,
  letterSpacing: "-0.03em",
  fontWeight: "$bold",
  color: "$body",
  margin: 0,
  textWrap: "balance",
  "@media (max-width: 760px)": { fontSize: 34 },
};
export const h2: CSS = {
  fontSize: 34,
  lineHeight: 1.12,
  letterSpacing: "-0.025em",
  fontWeight: "$bold",
  color: "$body",
  margin: 0,
  textWrap: "balance",
  "@media (max-width: 760px)": { fontSize: 27 },
};
export const h3: CSS = { fontSize: 19, lineHeight: 1.25, fontWeight: "$bold", color: "$body", margin: 0 };
export const lede: CSS = {
  fontSize: "$4",
  lineHeight: 1.6,
  color: "$textMiddle",
  marginTop: 16,
  maxWidth: 760,
  textWrap: "pretty",
  "& strong": { color: "$body", fontWeight: "$semibold" },
};
export const prose: CSS = {
  fontSize: "$3",
  lineHeight: 1.65,
  color: "$textMiddle",
  marginTop: 14,
  maxWidth: 780,
  textWrap: "pretty",
  "& strong": { color: "$body", fontWeight: "$semibold" },
  "& a": { color: "var(--theme-brand)", fontWeight: "$semibold" },
};
export const small: CSS = { fontSize: "$1", lineHeight: 1.5, color: "$textMiddle" };
export const cardPad: CSS = { padding: 26, "@media (max-width: 480px)": { padding: 18 } };
export const statValue: CSS = {
  fontSize: 30,
  lineHeight: 1.1,
  fontWeight: "$bold",
  letterSpacing: "-0.02em",
  color: "$body",
  fontVariantNumeric: "tabular-nums",
};
export const statLabel: CSS = { fontSize: "$2", color: "$textMiddle", marginTop: 6, lineHeight: 1.45 };

export const S0 = "var(--theme-cost-s0)";
export const S1 = "var(--theme-cost-s1)";
export const GRID = "var(--theme-cost-grid)";
export const INK_MUTED = "var(--theme-text-muted)";
export const INK_2 = "var(--theme-text-secondary)";
export const INK = "var(--theme-text-primary)";
export const SURFACE = "var(--theme-surface-card)";

/** A short line-key swatch so identity never rides on colour alone. */
export const swatch = (color: string): CSS => ({
  display: "inline-block",
  width: 14,
  height: 4,
  borderRadius: 2,
  backgroundColor: color,
  verticalAlign: "middle",
  marginRight: 7,
  flexShrink: 0,
});
