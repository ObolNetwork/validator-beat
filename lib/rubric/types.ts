export const COLORS = {
  green: "green",
  yellow: "yellow",
  red: "red",
} as const;

export type SliceColor = (typeof COLORS)[keyof typeof COLORS];

export type SliceId =
  | "keyCustody"
  | "clientDiversity"
  | "infraDiversity"
  | "osDiversity"
  | "cpuDiversity"
  | "geoDiversity";

export type Answers = Partial<Record<SliceId, SliceColor>>;

export type Stage = 0 | 1 | 2;

export type SliceMeta = {
  id: SliceId;
  label: string;
  short: string;
  why: string;
};

export type StageMeta = {
  /** Canonical display name, e.g. "Stage 1". */
  name: string;
  /** One-word epithet shown as a chip next to the name. */
  kind: string;
  /** One-line meaning of the stage. */
  tagline: string;
  /** Risk color the stage maps to across the UI. */
  tone: SliceColor;
};
