/**
 * The page's headline numbers at its defaults, computed by the same model
 * the page runs. Used by llms-full.txt / llms.txt / skill.md so agent docs
 * quote exactly what a visitor sees on first load.
 */
import { DEFAULT_PARAMS, type CostParams } from "./params";
import { economics, outcomeCases } from "./model";
import { expectations, simulate } from "./montecarlo";

export interface CostSummary {
  params: CostParams;
  stakePerOperatorEth: number;
  lossPerYearSoloEth: number;
  lossPerYearDvEth: number;
  premiumPerYearEth: number;
  netPerYearEth: number;
  breakEvenRatePct: number;
  /** 100 / break-even rate: years each operator must go without an incident for solo to win on average. */
  breakEvenYearsBetween: number;
  worstCaseSoloEth: number;
  worstCaseDvEth: number;
  worstCaseYearsOfPremium: number;
  caughtSoloEth: number;
  caughtDvEth: number;
  /** Share of simulated runs where the solo setup is still ahead after `params.years`. */
  pSoloAheadAtYears: number;
  meanDvAdvantageEth: number;
}

export function costSummary(p: CostParams = DEFAULT_PARAMS): CostSummary {
  const k = Math.max(1, Math.round(p.operators));
  const e = expectations(p);
  const econ = economics(p);
  const cases = outcomeCases(p);
  const full = cases.find((c) => c.id === "full")!;
  const lucky = cases.find((c) => c.id === "lucky")!;
  const mc = simulate(p);
  const last = mc.years[mc.years.length - 1];
  const be = Number(e.breakEvenRatePct.toFixed(e.breakEvenRatePct < 1 ? 2 : 1));
  return {
    params: p,
    stakePerOperatorEth: p.stakeEth / k,
    lossPerYearSoloEth: e.loss0PerYearEth,
    lossPerYearDvEth: e.loss1PerYearEth,
    premiumPerYearEth: econ.premiumPerYearEth,
    netPerYearEth: e.annualAdvantageEth,
    breakEvenRatePct: be,
    breakEvenYearsBetween: be > 0 ? 100 / be : Infinity,
    worstCaseSoloEth: full.stage0.breakdown.totalEth,
    worstCaseDvEth: full.stage1.breakdown.totalEth,
    worstCaseYearsOfPremium: full.stage0.breakdown.totalEth / econ.premiumPerYearEth,
    caughtSoloEth: lucky.stage0.breakdown.totalEth,
    caughtDvEth: lucky.stage1.breakdown.totalEth,
    pSoloAheadAtYears: last.pStage0Ahead,
    meanDvAdvantageEth: last.mean,
  };
}
