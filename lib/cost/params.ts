/**
 * Every assumption on /cost-of-failure, its default, its bounds and its URL
 * key. The page state is one `CostParams`; a shared link reproduces it.
 */
import { DEFAULT_NETWORK, QUEUE_PRESETS, SNAPSHOT, type NetworkState, type QueuePresetId } from "./network";

export type FocusEvent = "lucky" | "partial" | "full" | "outage";
export type FrequencyId = "rare" | "central" | "frequent";
export type SeverityId = "contained" | "central" | "severe";

export interface CostParams {
  stakeEth: number;
  /** Each operator's share of all staked ETH, percent. */
  operatorSharePct: number;
  /** Operators your stake is split across (n-way split). */
  operators: number;
  aprPct: number;
  ethUsd: number;
  /** Stage 0 operator fee, percent of rewards. */
  fee0Pct: number;
  /** Stage 1 operator fee, percent of rewards. */
  fee1Pct: number;

  queue: QueuePresetId | "custom";
  exitQueueEth: number;
  depositQueueEth: number;
  depositInflowEthPerEpoch: number;

  focus: FocusEvent;
  /** Slashed fraction for the "partial" case, percent. */
  partialPct: number;
  slashSpreadDays: number;
  /** The whole operator's book exits after a compromise (vs only your keys). */
  operatorWide: boolean;
  redepositDelayDays: number;

  eip7716: boolean;
  outageHours: number;

  reshareEpochs: number;
  /** Share of Stage 1 compromises fixed by a reshare rather than consolidation, percent. */
  s1ResharePct: number;
  /** Share of incidents that still reach a signing threshold on Stage 1, percent. */
  s1ResidualPct: number;
  /** Share of outages a Stage 1 cluster rides through, percent. */
  s1LivenessCoverPct: number;

  frequency: FrequencyId | "custom";
  /** Safety incidents per operator per year, percent. */
  incidentRatePct: number;
  /** Coefficient of variation of the incident rate across runs. */
  rateUncertainty: number;
  severity: SeverityId | "custom";
  /** Probability an incident ends in slashing, percent. */
  pSlashPct: number;
  /** Beta(a, b) for the slashed fraction, given a slashing. */
  betaA: number;
  betaB: number;
  /** Outages per operator per year. */
  outagesPerYear: number;
  /** Median outage length, hours (log-normal, σ = 1). */
  outageMedianHours: number;

  years: number;
  runs: number;
  seed: number;
  /** Heatmap shows the chance Stage 0 is ahead, or the average outcome. */
  heatView: "chance" | "average";
}

export const FREQUENCY_PRESETS: Record<FrequencyId, { label: string; hint: string; incidentRatePct: number }> = {
  rare: { label: "Rare", hint: "1 in 100 operator-years", incidentRatePct: 1 },
  central: { label: "Base rate", hint: "~8 incidents across ~50 operators since 2023", incidentRatePct: 4 },
  frequent: { label: "Frequent", hint: "1 in 10 operator-years", incidentRatePct: 10 },
};

/**
 * How bad "bad" is. Stolen keys gain leverage the more of them an attacker
 * holds (a bigger slashing hurts the victim more per key), so given a
 * slashing, the slashed fraction is skewed towards all of it.
 */
export const SEVERITY_PRESETS: Record<
  SeverityId,
  { label: string; hint: string; pSlashPct: number; betaA: number; betaB: number }
> = {
  contained: { label: "Contained", hint: "Usually caught; small slashings", pSlashPct: 25, betaA: 1, betaB: 3 },
  central: { label: "Skewed big", hint: "Half slash, most of the keys", pSlashPct: 50, betaA: 3, betaB: 1 },
  severe: { label: "Worst case", hint: "Attackers usually slash everything", pSlashPct: 75, betaA: 8, betaB: 1 },
};

export const DEFAULT_PARAMS: CostParams = {
  stakeEth: 200_000,
  operatorSharePct: 10,
  operators: 1,
  aprPct: SNAPSHOT.aprPct,
  ethUsd: SNAPSHOT.ethUsd,
  fee0Pct: 2,
  fee1Pct: 4,

  queue: "today",
  exitQueueEth: DEFAULT_NETWORK.exitQueueEth,
  depositQueueEth: DEFAULT_NETWORK.depositQueueEth,
  depositInflowEthPerEpoch: DEFAULT_NETWORK.depositInflowEthPerEpoch,

  focus: "full",
  partialPct: 25,
  slashSpreadDays: 0,
  operatorWide: true,
  redepositDelayDays: 0,

  eip7716: false,
  outageHours: 6,

  reshareEpochs: 5,
  s1ResharePct: 70,
  s1ResidualPct: 1,
  s1LivenessCoverPct: 80,

  frequency: "central",
  incidentRatePct: FREQUENCY_PRESETS.central.incidentRatePct,
  rateUncertainty: 0.5,
  severity: "central",
  pSlashPct: SEVERITY_PRESETS.central.pSlashPct,
  betaA: SEVERITY_PRESETS.central.betaA,
  betaB: SEVERITY_PRESETS.central.betaB,
  outagesPerYear: 1,
  outageMedianHours: 4,

  years: 10,
  runs: 5000,
  seed: 7716,
  heatView: "chance",
};

export function networkFromParams(p: CostParams): NetworkState {
  return {
    ...DEFAULT_NETWORK,
    exitQueueEth: p.exitQueueEth,
    depositQueueEth: p.depositQueueEth,
    depositInflowEthPerEpoch: p.depositInflowEthPerEpoch,
    aprPct: p.aprPct,
    ethUsd: p.ethUsd,
  };
}

export function applyQueuePreset(p: CostParams, id: QueuePresetId): CostParams {
  const q = QUEUE_PRESETS.find((x) => x.id === id)!;
  return { ...p, queue: id, exitQueueEth: q.exitQueueEth, depositQueueEth: q.depositQueueEth };
}

export function applyFrequency(p: CostParams, id: FrequencyId): CostParams {
  return { ...p, frequency: id, incidentRatePct: FREQUENCY_PRESETS[id].incidentRatePct };
}

export function applySeverity(p: CostParams, id: SeverityId): CostParams {
  const s = SEVERITY_PRESETS[id];
  return { ...p, severity: id, pSlashPct: s.pSlashPct, betaA: s.betaA, betaB: s.betaB };
}

// ── URL state ───────────────────────────────────────────────────────────────

type Key = keyof CostParams;
const URL_KEYS: Record<Key, string> = {
  stakeEth: "s",
  operatorSharePct: "o",
  operators: "k",
  aprPct: "apr",
  ethUsd: "px",
  fee0Pct: "f0",
  fee1Pct: "f1",
  queue: "q",
  exitQueueEth: "xq",
  depositQueueEth: "dq",
  depositInflowEthPerEpoch: "di",
  focus: "e",
  partialPct: "pf",
  slashSpreadDays: "sd",
  operatorWide: "ow",
  redepositDelayDays: "rd",
  eip7716: "x7",
  outageHours: "oh",
  reshareEpochs: "re",
  s1ResharePct: "rs",
  s1ResidualPct: "rr",
  s1LivenessCoverPct: "lc",
  frequency: "fr",
  incidentRatePct: "ir",
  rateUncertainty: "ru",
  severity: "sv",
  pSlashPct: "ps",
  betaA: "ba",
  betaB: "bb",
  outagesPerYear: "or",
  outageMedianHours: "om",
  years: "y",
  runs: "n",
  seed: "seed",
  heatView: "hv",
};

const ENUMS: Partial<Record<Key, readonly string[]>> = {
  queue: ["today", "avg90", "worst90", "empty", "custom"],
  focus: ["lucky", "partial", "full", "outage"],
  frequency: ["rare", "central", "frequent", "custom"],
  severity: ["contained", "central", "severe", "custom"],
  heatView: ["chance", "average"],
};

/** Only parameters that differ from the defaults go in the URL. */
export function encodeParams(p: CostParams): string {
  const q = new URLSearchParams();
  (Object.keys(URL_KEYS) as Key[]).forEach((k) => {
    const v = p[k];
    if (v === DEFAULT_PARAMS[k]) return;
    q.set(URL_KEYS[k], typeof v === "boolean" ? (v ? "1" : "0") : String(v));
  });
  return q.toString();
}

/**
 * Allowed range per numeric parameter: the same bounds as the page's
 * controls. Values from a URL are clamped to these, so a crafted link can't
 * ask the simulation for a billion runs or an impossible network.
 */
type NumKey = { [K in keyof CostParams]: CostParams[K] extends number ? K : never }[keyof CostParams];
export const PARAM_BOUNDS: Record<NumKey, { min: number; max: number; int?: boolean }> = {
  stakeEth: { min: 32, max: 10_000_000 },
  operatorSharePct: { min: 0.5, max: 33 },
  operators: { min: 1, max: 10, int: true },
  aprPct: { min: 1.5, max: 4.5 },
  ethUsd: { min: 1, max: 1_000_000 },
  fee0Pct: { min: 0, max: 5 },
  fee1Pct: { min: 0, max: 5 },
  exitQueueEth: { min: 0, max: 5_000_000 },
  depositQueueEth: { min: 0, max: 4_000_000 },
  depositInflowEthPerEpoch: { min: 0, max: 400 },
  partialPct: { min: 5, max: 95 },
  slashSpreadDays: { min: 0, max: 90 },
  redepositDelayDays: { min: 0, max: 14 },
  outageHours: { min: 1, max: 72 },
  reshareEpochs: { min: 1, max: 30, int: true },
  s1ResharePct: { min: 0, max: 100 },
  s1ResidualPct: { min: 0, max: 10 },
  s1LivenessCoverPct: { min: 0, max: 100 },
  incidentRatePct: { min: 0, max: 15 },
  rateUncertainty: { min: 0, max: 1.5 },
  pSlashPct: { min: 0, max: 100 },
  betaA: { min: 0.5, max: 10 },
  betaB: { min: 0.5, max: 10 },
  outagesPerYear: { min: 0, max: 6 },
  outageMedianHours: { min: 0.5, max: 48 },
  years: { min: 1, max: 20, int: true },
  runs: { min: 1000, max: 20_000, int: true },
  seed: { min: 0, max: 2 ** 32 - 1, int: true },
};

/** Clamp every number to its bounds and reset unknown enum or boolean values to defaults. */
export function sanitizeParams(input: Partial<CostParams>): CostParams {
  const out: CostParams = { ...DEFAULT_PARAMS };
  const rec = out as unknown as Record<string, unknown>;
  (Object.keys(DEFAULT_PARAMS) as Key[]).forEach((k) => {
    const v = (input as Record<string, unknown>)[k];
    const def = DEFAULT_PARAMS[k];
    if (typeof def === "number") {
      const b = PARAM_BOUNDS[k as NumKey];
      if (typeof v !== "number" || !Number.isFinite(v)) return;
      const c = Math.min(b.max, Math.max(b.min, v));
      rec[k] = b.int ? Math.round(c) : c;
    } else if (typeof def === "boolean") {
      if (typeof v === "boolean") rec[k] = v;
    } else if (typeof v === "string" && ENUMS[k]?.includes(v)) {
      rec[k] = v;
    }
  });
  return out;
}

export function decodeParams(search: string): CostParams {
  const q = new URLSearchParams(search);
  const out: CostParams = { ...DEFAULT_PARAMS };
  (Object.keys(URL_KEYS) as Key[]).forEach((k) => {
    const raw = q.get(URL_KEYS[k]);
    if (raw === null) return;
    const def = DEFAULT_PARAMS[k];
    if (typeof def === "boolean") {
      (out as unknown as Record<string, unknown>)[k] = raw === "1";
    } else if (typeof def === "number") {
      const v = Number(raw);
      if (Number.isFinite(v)) (out as unknown as Record<string, unknown>)[k] = v;
    } else if (ENUMS[k]?.includes(raw)) {
      (out as unknown as Record<string, unknown>)[k] = raw;
    }
  });
  return sanitizeParams(out);
}
