/**
 * Every assumption on /cost-of-failure, its default, its bounds and its URL
 * key. The page state is one `CostParams`; a shared link reproduces it.
 */
import { DEFAULT_NETWORK, QUEUE_PRESETS, SNAPSHOT, type NetworkState, type QueuePresetId } from "./network";
import { PINNED } from "./snapshots";

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
  /** Basic shows the answer; Advanced shows the model and every assumption. */
  view: "basic" | "advanced";
  /**
   * Operators of different sizes, as "stake:share%,stake:share%,…" (e.g.
   * "318000:9.96,183000:6.53"). Empty means an equal split of `stakeEth`
   * across `operators`, each at `operatorSharePct`. When set, it overrides
   * those three (sanitizeParams keeps them in sync).
   */
  opList: string;
  /** Extra DV cluster members that hold no stake of their own (e.g. your own node). */
  extraNodes: number;
  /** Pin a network snapshot and its defaults (e.g. "2026-10-19"); empty = latest. */
  snap: string;
}

export interface Operator {
  stakeEth: number;
  sharePct: number;
}

export const MAX_OPERATORS = 10;

/** Parse "stake:share,…" into operators; null if empty or malformed. Values are clamped. */
export function parseOps(text: string): Operator[] | null {
  if (!text || !text.trim()) return null;
  const parts = text.split(",").map((x) => x.trim()).filter(Boolean);
  if (parts.length === 0 || parts.length > MAX_OPERATORS) return null;
  const ops: Operator[] = [];
  for (const part of parts) {
    const [a, b] = part.split(":");
    const stake = Number(a);
    const share = Number(b);
    if (!Number.isFinite(stake) || !Number.isFinite(share) || stake <= 0 || share <= 0) return null;
    ops.push({
      stakeEth: Math.min(10_000_000, Math.max(1, stake)),
      sharePct: Math.min(33, Math.max(0.1, Math.round(share * 100) / 100)),
    });
  }
  return ops;
}

export function formatOps(ops: Operator[]): string {
  return ops.map((o) => `${Math.round(o.stakeEth)}:${o.sharePct}`).join(",");
}

export const FREQUENCY_PRESETS: Record<FrequencyId, { label: string; hint: string; incidentRatePct: number }> = {
  rare: { label: "Rare", hint: "1 in 100 operator-years", incidentRatePct: 1 },
  central: { label: "Base rate", hint: "~8 incidents across ~50 operators since 2023", incidentRatePct: 4 },
  frequent: { label: "AI-era", hint: "Cheaper, AI-assisted intrusion: 1 in 10 operator-years", incidentRatePct: 10 },
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
  operators: 4,
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
  view: "basic",
  opList: "",
  extraNodes: 0,
  snap: "",
};

export function networkFromParams(p: CostParams): NetworkState {
  const pin = p.snap ? PINNED[p.snap] : undefined;
  return {
    ...DEFAULT_NETWORK,
    ...(pin ? { totalActiveEth: pin.network.totalActiveEth, activeValidators: pin.network.activeValidators } : {}),
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
/** What each parameter means, for llms-full.txt and anyone building a link by hand. */
export const PARAM_DOCS: Record<keyof CostParams, string> = {
  stakeEth: "Your total stake, ETH.",
  operatorSharePct: "Each operator's share of all staked ETH, percent. Drives the correlation penalty and how long its book takes to exit.",
  operators: "How many operators your stake is split across (solo setup), or that run it together (multi-operator DV).",
  aprPct: "Staking APR, consensus plus execution, percent.",
  ethUsd: "ETH price in USD, for the dollar figures.",
  fee0Pct: "Solo-operator fee, percent of staking rewards.",
  fee1Pct: "Multi-operator DV fee, percent of staking rewards.",
  queue: "Queue preset: today, avg90, worst90, empty, or custom.",
  exitQueueEth: "ETH in the exit queue ahead of a new exit.",
  depositQueueEth: "ETH in the pending-deposit (entry) queue.",
  depositInflowEthPerEpoch: "New competing deposits per epoch while you wait to re-enter, ETH.",
  focus: "Which single incident the Advanced view details: lucky (caught in time), partial, full (every key slashed) or outage.",
  partialPct: "Share of an operator's keys slashed in the partial case, percent.",
  slashSpreadDays: "Days over which the attacker spreads slashings (0 = all at once, which maximises the correlation penalty).",
  operatorWide: "1 if a compromise makes the operator's whole book exit, 0 if only your validators exit.",
  redepositDelayDays: "Your own delay between withdrawal and re-depositing, days.",
  eip7716: "1 to apply the draft EIP-7716 correlated downtime penalties to outages.",
  outageHours: "Length of the outage in the Advanced outage case, hours.",
  reshareEpochs: "Epochs offline while a DV reshares away a compromised key-holder (good leaver).",
  s1ResharePct: "Share of DV compromises fixed by a reshare rather than consolidating onto new keys, percent.",
  s1ResidualPct: "Share of incidents where the attacker still reaches a DV's signing threshold, percent.",
  s1LivenessCoverPct: "Share of a solo operator's outage losses a DV avoids, percent.",
  frequency: "Incident-rate preset: rare, central (base rate), frequent, or custom.",
  incidentRatePct: "Key or security incidents per operator per year, percent.",
  rateUncertainty: "Spread of the incident rate across simulated runs (coefficient of variation).",
  severity: "Severity preset: contained, central (skewed big), severe, or custom.",
  pSlashPct: "Share of incidents that end in slashing, percent.",
  betaA: "Beta(a, b) shape of the share of keys slashed: higher a skews towards slashing all of them.",
  betaB: "Beta(a, b) shape of the share of keys slashed: higher b skews towards slashing a few.",
  outagesPerYear: "Outages per operator per year.",
  outageMedianHours: "Median outage length, hours (log-normal).",
  years: "Years each simulated run lasts.",
  runs: "Number of simulated runs.",
  seed: "Random seed: the same seed and settings reproduce the same runs.",
  heatView: "Heatmap view: chance (of the solo setup being ahead) or average (outcome).",
  view: "Page view: basic or advanced.",
  opList: "Operators of different sizes, as stake:share% pairs separated by commas (e.g. 318000:9.96,183000:6.53). Overrides s, k and o.",
  extraNodes: "Extra multi-operator DV cluster members with no stake of their own, such as your own node.",
  snap: "Pin a network snapshot and that day's defaults (e.g. 2026-10-19), so a shared link keeps its numbers.",
};

/** The query-string key for every parameter (shared links, llms-full.txt). */
export const URL_KEYS: Record<Key, string> = {
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
  view: "v",
  opList: "ops",
  extraNodes: "xn",
  snap: "snap",
};

/** Allowed values for the enum parameters. */
export const PARAM_ENUMS: Partial<Record<Key, readonly string[]>> = {
  queue: ["today", "avg90", "worst90", "empty", "custom"],
  focus: ["lucky", "partial", "full", "outage"],
  frequency: ["rare", "central", "frequent", "custom"],
  severity: ["contained", "central", "severe", "custom"],
  heatView: ["chance", "average"],
  view: ["basic", "advanced"],
};

/** The defaults a link is read against: the latest, or a pinned snapshot's. */
export function defaultsFor(snap: string): CostParams {
  const pin = snap ? PINNED[snap] : undefined;
  return pin ? { ...DEFAULT_PARAMS, ...(pin.defaults as Partial<CostParams>), snap } : DEFAULT_PARAMS;
}

/** Only parameters that differ from the defaults (or the pinned defaults) go in the URL. */
export function encodeParams(p: CostParams): string {
  const q = new URLSearchParams();
  const base = defaultsFor(p.snap);
  (Object.keys(URL_KEYS) as Key[]).forEach((k) => {
    const v = p[k];
    if (v === base[k] && k !== "snap") return;
    if (k === "snap" && !v) return;
    q.set(URL_KEYS[k], typeof v === "boolean" ? (v ? "1" : "0") : String(v));
  });
  // ":" and "," are safe in a query value; keep ops=318000:9.96,183000:6.53 readable in reports.
  return q.toString().replace(/%3A/gi, ":").replace(/%2C/gi, ",");
}

/**
 * Allowed range per numeric parameter: the same bounds as the page's
 * controls. Values from a URL are clamped to these, so a crafted link can't
 * ask the simulation for a billion runs or an impossible network.
 */
type NumKey = { [K in keyof CostParams]: CostParams[K] extends number ? K : never }[keyof CostParams];
export const PARAM_BOUNDS: Record<NumKey, { min: number; max: number; int?: boolean }> = {
  stakeEth: { min: 1, max: 10_000_000 },
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
  extraNodes: { min: 0, max: 3, int: true },
};

/** Clamp every number to its bounds and reset unknown enum or boolean values to defaults. */
export function sanitizeParams(input: Partial<CostParams>): CostParams {
  const out: CostParams = { ...defaultsFor(typeof input.snap === "string" && PINNED[input.snap] ? input.snap : "") };
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
    } else if (typeof v === "string" && PARAM_ENUMS[k]?.includes(v)) {
      rec[k] = v;
    }
  });
  // Free-text parameters: an operator list and a snapshot id.
  const ops = parseOps(typeof input.opList === "string" ? input.opList : "");
  if (ops) {
    out.opList = formatOps(ops);
    out.stakeEth = Math.round(ops.reduce((a, o) => a + o.stakeEth, 0));
    out.operators = ops.length;
  }
  if (typeof input.snap === "string" && PINNED[input.snap]) out.snap = input.snap;
  return out;
}

export function decodeParams(search: string): CostParams {
  const q = new URLSearchParams(search);
  const snap = q.get(URL_KEYS.snap) ?? "";
  const out: CostParams = { ...defaultsFor(PINNED[snap] ? snap : "") };
  (Object.keys(URL_KEYS) as Key[]).forEach((k) => {
    const raw = q.get(URL_KEYS[k]);
    if (raw === null) return;
    const def = DEFAULT_PARAMS[k];
    if (typeof def === "boolean") {
      (out as unknown as Record<string, unknown>)[k] = raw === "1";
    } else if (typeof def === "number") {
      const v = Number(raw);
      if (Number.isFinite(v)) (out as unknown as Record<string, unknown>)[k] = v;
    } else if (PARAM_ENUMS[k]?.includes(raw)) {
      (out as unknown as Record<string, unknown>)[k] = raw;
    } else if (k === "opList" || k === "snap") {
      (out as unknown as Record<string, unknown>)[k] = raw;
    }
  });
  return sanitizeParams(out);
}
