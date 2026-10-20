import { EPOCHS_PER_DAY, EPOCHS_PER_SLASHINGS_VECTOR, MIN_VALIDATOR_WITHDRAWABILITY_DELAY } from "./protocol";
import {
  DEFAULT_NETWORK,
  activationExitChurnEth,
  balanceChurnEth,
  consolidationChurnEth,
  sweepCycleDays,
  type NetworkState,
} from "./network";
import {
  baseRewardPerIncrementGwei,
  eip7716Factor,
  inactivityLeakEth,
  missedAttestationPenaltyPerEpoch,
  outageCost,
} from "./rewards";
import { correlationPenaltyPerEth, goodLeaver, safetyEvent, type SafetyEventInput } from "./events";
import { DEFAULT_PARAMS, applyQueuePreset, decodeParams, encodeParams, sanitizeParams, type CostParams } from "./params";
import { outcomeCases, safetyCase, stage1Compromise } from "./model";
import { expectations, simulate } from "./montecarlo";

const T = 43_691_145;
const net = (o: Partial<NetworkState> = {}): NetworkState => ({ ...DEFAULT_NETWORK, totalActiveEth: T, ...o });
const event = (o: Partial<SafetyEventInput> = {}) =>
  safetyEvent({
    stakeEth: 200_000,
    operatorShare: 0.1,
    scope: "operator",
    slashedFraction: 0,
    slashSpreadDays: 0,
    restake: true,
    redepositDelayDays: 0,
    network: net(),
    ...o,
  });

/** The risk note's simplified inputs: 90-day average queues, 2.61% APR. */
const NOTE: CostParams = { ...applyQueuePreset(DEFAULT_PARAMS, "avg90"), aprPct: 2.61 };

describe("spec pieces, hand-computed", () => {
  it("churn limits at 43.69M ETH", () => {
    // floor(43,691,145 / 65,536) = 666
    expect(balanceChurnEth(T)).toBe(666);
    expect(activationExitChurnEth(T)).toBe(256);
    expect(consolidationChurnEth(T)).toBe(410);
    // Below 16.78M ETH the 128 ETH floor binds and exits get all of it.
    expect(balanceChurnEth(5_000_000)).toBe(128);
    expect(activationExitChurnEth(5_000_000)).toBe(128);
  });

  it("base reward per increment", () => {
    // isqrt(43,691,145e9) = 209,024,269; 64e9 // that = 306 Gwei
    expect(baseRewardPerIncrementGwei(T)).toBe(306);
    expect(missedAttestationPenaltyPerEpoch(T)).toBeCloseTo((306e-9 * 40) / 64, 15);
  });

  it("process_slashings: penalty per ETH is 3× the slashed share, floored per increment in Gwei", () => {
    expect(correlationPenaltyPerEth(0.1 * T, T)).toBeCloseTo(0.3, 9);
    expect(correlationPenaltyPerEth(0.5 * T, T)).toBe(1);
    // Electra rounding: 32 ETH slashed alone costs floor(96e9 / 43,691,145) = 2,197 Gwei per ETH.
    expect(correlationPenaltyPerEth(32, T)).toBeCloseTo(2197e-9, 15);
  });

  it("sweep cycle: validators / 16 per slot", () => {
    expect(sweepCycleDays(net({ activeValidators: 829_823 }))).toBeCloseTo((829_823 / 16) * 12 / 86_400, 9);
  });

  it("EIP-7716 onset factor matches validator-downtime", () => {
    expect(eip7716Factor(0)).toBe(1);
    expect(eip7716Factor(0.1)).toBeCloseTo(77.5, 9);
    expect(eip7716Factor(0.4)).toBe(256);
  });

  it("inactivity leak ≈ balance × n² / 2^25", () => {
    const n = 1000;
    expect(inactivityLeakEth(32, n + 4)).toBeCloseTo((32 * n * (n + 1)) / 2 ** 25, 9);
  });

  it("outage: forgone + source/target, no leak below ⅓", () => {
    const c = outageCost({ stakeEth: 32, epochsDown: 225, cohortFraction: 0.1, totalActiveEth: T, aprPct: 2.55, eip7716: false });
    expect(c.leakEth).toBe(0);
    expect(c.attestationPenaltyEth).toBeCloseTo(32 * missedAttestationPenaltyPerEpoch(T) * 225, 12);
    const x = outageCost({ stakeEth: 32, epochsDown: 225, cohortFraction: 0.1, totalActiveEth: T, aprPct: 2.55, eip7716: true });
    expect(x.eip7716ExtraEth).toBeGreaterThan(0);
    expect(x.totalEth).toBeGreaterThan(c.totalEth);
  });
});

describe("safety events", () => {
  it("own-stake precautionary exit: unpaid = delay + sweep + entry queue", () => {
    const r = event({ scope: "own", network: net({ exitQueueEth: 0, depositQueueEth: 0, depositInflowEthPerEpoch: 0 }) });
    expect(r.breakdown.attestationPenaltyEth).toBe(0);
    expect(r.breakdown.correlationPenaltyEth).toBe(0);
    // ~27h delay + ~3.6d sweep + activation latency. Re-deposits arrive at the
    // same 256 ETH/epoch they exited at, so an empty entry queue never builds.
    expect(r.unpaidDays).toBeGreaterThan(4.5);
    expect(r.unpaidDays).toBeLessThan(6);
  });

  it("own-stake slashing: withdrawable after 8192 epochs, correlation 3 × stake / total", () => {
    const r = event({ scope: "own", slashedFraction: 1 });
    expect(r.breakdown.initialPenaltyEth).toBeCloseTo(200_000 / 4096, 6);
    expect(r.correlationFraction).toBeCloseTo((3 * 200_000) / T, 5);
    const lock = EPOCHS_PER_SLASHINGS_VECTOR * missedAttestationPenaltyPerEpoch(T) * 200_000;
    expect(r.breakdown.attestationPenaltyEth).toBeCloseTo(lock, 3);
  });

  it("validators that exit too late escape their own correlation penalty (spec quirk)", () => {
    // Withdrawable later than 12,288 epochs → process_slashings runs after the
    // slashing has left the 8192-epoch vector.
    const late = (12_288 - MIN_VALIDATOR_WITHDRAWABILITY_DELAY + 100) * 256;
    const r = event({ scope: "own", stakeEth: 32, slashedFraction: 1, network: net({ exitQueueEth: late }) });
    expect(r.breakdown.correlationPenaltyEth).toBe(0);
    const early = event({ scope: "own", stakeEth: 32, slashedFraction: 1, network: net({ exitQueueEth: 0 }) });
    expect(early.breakdown.correlationPenaltyEth).toBeGreaterThan(0);
  });

  it("a whole 10% operator takes ~79 days to drain through 256 ETH/epoch", () => {
    const r = event({ network: net({ exitQueueEth: 0 }) });
    expect(r.drainDays).toBeCloseTo((0.1 * T) / 256 / EPOCHS_PER_DAY, 6);
  });

  it("monotonic in slashed fraction, operator share and exit queue", () => {
    let prev = -1;
    for (const f of [0, 0.1, 0.25, 0.5, 0.75, 1]) {
      const v = event({ slashedFraction: f }).breakdown.totalEth;
      expect(v).toBeGreaterThanOrEqual(prev);
      prev = v;
    }
    prev = -1;
    for (const s of [0.01, 0.03, 0.05, 0.1, 0.2]) {
      const v = event({ operatorShare: s, slashedFraction: 0.5, network: net({ exitQueueEth: 0 }) }).breakdown.totalEth;
      expect(v).toBeGreaterThanOrEqual(prev);
      prev = v;
    }
    // Exit wait: monotonic only while the deposit backlog is steady (inflow =
    // churn). With a draining backlog a longer exit wait shortens re-entry, and
    // past ~53 days slashed validators escape correlation: neither is a bug.
    prev = -1;
    for (const q of [0, 1e5, 5e5, 1e6, 2e6]) {
      const v = event({ network: net({ exitQueueEth: q, depositInflowEthPerEpoch: 256 }) }).breakdown.totalEth;
      expect(v).toBeGreaterThanOrEqual(prev * (1 - 1e-5)); // epoch rounding
      prev = v;
    }
  });

  it("a draining deposit queue makes a longer exit wait cheaper (documented non-monotonicity)", () => {
    const short = event({ scope: "own", network: net({ exitQueueEth: 0 }) }).breakdown.totalEth;
    const long = event({ scope: "own", network: net({ exitQueueEth: 2e6 }) }).breakdown.totalEth;
    expect(long).toBeLessThan(short);
  });

  it("loss as a share of stake does not depend on stake size inside one operator", () => {
    const a = event({ stakeEth: 10_000, slashedFraction: 0.5 });
    const b = event({ stakeEth: 400_000, slashedFraction: 0.5 });
    expect(a.breakdown.totalEth / 10_000).toBeCloseTo(b.breakdown.totalEth / 400_000, 6);
  });
});

describe("Stage 1", () => {
  it("is never worse than Stage 0 for a single compromise", () => {
    for (const c of outcomeCases(DEFAULT_PARAMS)) {
      expect(c.stage1.breakdown.totalEth).toBeLessThanOrEqual(c.stage0.breakdown.totalEth + 1e-9);
    }
  });

  it("bad leaver ≈ the withdrawability delay of rewards plus seed deposits", () => {
    const { bad } = stage1Compromise(NOTE);
    const delayOnly = (200_000 * 0.0261 * (257 / EPOCHS_PER_DAY)) / 365.25;
    expect(bad.breakdown.totalEth).toBeGreaterThan(delayOnly);
    expect(bad.breakdown.totalEth).toBeLessThan(delayOnly * 2);
  });

  it("good leaver costs under 1 ETH on 200K", () => {
    const r = goodLeaver({ stakeEth: 200_000, operatorShare: 0.1, scope: "operator", network: net(), reshareEpochs: 5 });
    expect(r.breakdown.totalEth).toBeLessThan(1);
  });
});

describe("risk-note reconciliation (simplified inputs)", () => {
  // The note's figures; the precise model is lower where noted on the page:
  // the note priced liveness at 1.5× forgone rewards and charged every
  // slashed validator the full correlation penalty.
  const close = (got: number, want: number, tol: number) => expect(Math.abs(got / want - 1)).toBeLessThan(tol);
  const own = { ...NOTE, operatorWide: false };

  it("precautionary exit, own stake ~582 ETH", () => close(safetyCase(own, 0).breakdown.totalEth, 582, 0.1));
  it("precautionary exit, whole operator ~1,099 ETH", () => close(safetyCase(NOTE, 0).breakdown.totalEth, 1099, 0.2));
  it("slashed, own stake ~4,402 ETH", () => close(safetyCase(own, 1).breakdown.totalEth, 4402, 0.12));
  it("whole operator slashed: below the note's 62,249 because deep-queue validators escape correlation", () => {
    const v = safetyCase(NOTE, 1).breakdown.totalEth;
    expect(v).toBeLessThan(62_249);
    expect(v).toBeGreaterThan(62_249 * 0.5);
  });
  it("Monte Carlo: ~81% of solo runs ahead after 10 years", () => {
    const mc = simulate({
      ...NOTE,
      fee0Pct: 0,
      fee1Pct: 3.25,
      incidentRatePct: 4,
      rateUncertainty: 0,
      pSlashPct: 50,
      betaA: 1,
      betaB: 1,
      outagesPerYear: 0,
      runs: 4000,
    });
    expect(Math.abs(mc.years[9].pStage0Ahead - 0.81)).toBeLessThan(0.03);
  });
});

describe("Monte Carlo and expectations", () => {
  it("is reproducible from the seed", () => {
    const a = simulate({ ...DEFAULT_PARAMS, runs: 500 });
    const b = simulate({ ...DEFAULT_PARAMS, runs: 500 });
    expect(a.years[9].mean).toBe(b.years[9].mean);
    const c = simulate({ ...DEFAULT_PARAMS, runs: 500, seed: 1 });
    expect(c.years[9].mean).not.toBe(a.years[9].mean);
  });

  it("with no incidents, Stage 0 is always ahead by the premium", () => {
    const mc = simulate({ ...DEFAULT_PARAMS, incidentRatePct: 0, outagesPerYear: 0, runs: 50, years: 3 });
    expect(mc.years[2].pStage0Ahead).toBe(1);
    expect(mc.years[0].mean).toBeCloseTo(-(200_000 * 0.0255 * 0.02), 6);
  });

  it("break-even rate is where the expected advantage is zero", () => {
    const e = expectations(DEFAULT_PARAMS);
    const at = expectations({ ...DEFAULT_PARAMS, incidentRatePct: e.breakEvenRatePct });
    expect(Math.abs(at.annualAdvantageEth)).toBeLessThan(1e-6);
  });
});

describe("URL state", () => {
  it("round-trips and omits defaults", () => {
    expect(encodeParams(DEFAULT_PARAMS)).toBe("");
    const p: CostParams = { ...DEFAULT_PARAMS, stakeEth: 5000, eip7716: true, severity: "severe", fee1Pct: 3.75 };
    expect(decodeParams(encodeParams(p))).toEqual(p);
  });

  it("clamps out-of-range values from a crafted link", () => {
    const p = decodeParams("n=1000000000&y=100000&k=500&s=-5&seed=1.7&o=99");
    expect(p.runs).toBe(20_000);
    expect(p.years).toBe(20);
    expect(p.operators).toBe(10);
    expect(p.stakeEth).toBe(32);
    expect(p.seed).toBe(2);
    expect(p.operatorSharePct).toBe(33);
  });

  it("defaults sit inside their own bounds", () => {
    expect(sanitizeParams(DEFAULT_PARAMS)).toEqual(DEFAULT_PARAMS);
  });

  it("ignores junk", () => {
    expect(decodeParams("s=abc&e=nope&x7=1").stakeEth).toBe(DEFAULT_PARAMS.stakeEth);
    expect(decodeParams("e=nope").focus).toBe(DEFAULT_PARAMS.focus);
  });
});
