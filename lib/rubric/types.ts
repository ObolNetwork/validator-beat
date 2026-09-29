export const COLORS = {
  green: "green",
  yellow: "yellow",
  red: "red",
  /** "Not sure" — scored like red, because an unverified gap has to be assumed open. */
  unknown: "unknown",
} as const;

export type SliceColor = (typeof COLORS)[keyof typeof COLORS];

export type SliceId =
  | "keyCustody"
  | "clientDiversity"
  | "infraDiversity"
  | "osDiversity"
  | "cpuDiversity"
  | "geoDiversity";

/**
 * Which failure mode a slice guards against. Safety slices gate Stage 1
 * (no single failure can get you slashed); liveness slices only gate Stage 2.
 */
export type SliceKind = "safety" | "liveness";

export type Answers = Partial<Record<SliceId, SliceColor>>;

export type Stage = 0 | 1 | 2;

export type SliceMeta = {
  id: SliceId;
  label: string;
  short: string;
  kind: SliceKind;
  /** Banded answers the question offers, best → worst. "Not sure" is always available on top. */
  bands: readonly SliceColor[];
  why: string;
};

export type StageMeta = {
  /** Canonical display name, e.g. "Stage 1". */
  name: string;
  /** One-word epithet shown as a chip next to the name. */
  kind: string;
  /** One-line meaning of the stage. */
  tagline: string;
  /** Punchy one-liner for share cards and OG preview images. */
  shareLine: string;
  /** Risk color the stage maps to across the UI. */
  tone: SliceColor;
};
