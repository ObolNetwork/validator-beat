/** Display formatting for the cost-of-failure page. */

export function fmtEth(eth: number, opts: { unit?: boolean } = {}): string {
  const unit = opts.unit === false ? "" : " ETH";
  const a = Math.abs(eth);
  let s: string;
  if (a >= 100) s = Math.round(eth).toLocaleString("en-US");
  else if (a >= 10) s = eth.toFixed(0);
  else if (a >= 1) s = eth.toFixed(1);
  else if (a >= 0.01) s = eth.toFixed(2);
  else if (a === 0) s = "0";
  else s = eth.toPrecision(1);
  return s + unit;
}

export function fmtCompact(x: number): string {
  const a = Math.abs(x);
  const sign = x < 0 ? "−" : "";
  if (a >= 1e6) return `${sign}${(a / 1e6).toFixed(a >= 1e7 ? 0 : 1)}M`;
  if (a >= 1e3) return `${sign}${(a / 1e3).toFixed(a >= 1e4 ? 0 : 1)}K`;
  if (a >= 1) return `${sign}${a.toFixed(0)}`;
  return `${sign}${a.toPrecision(1)}`;
}

export function fmtUsd(usd: number): string {
  const a = Math.abs(usd);
  if (a >= 1e9) return `$${(usd / 1e9).toFixed(2)}B`;
  if (a >= 1e6) return `$${(usd / 1e6).toFixed(1)}M`;
  if (a >= 1e4) return `$${Math.round(usd / 1e3)}K`;
  return `$${Math.round(usd).toLocaleString("en-US")}`;
}

export function fmtDays(days: number): string {
  if (!Number.isFinite(days)) return "never";
  if (days < 1 / 24) return `${Math.max(1, Math.round(days * 1440))} min`;
  if (days < 2) return `${(days * 24).toFixed(days < 0.5 ? 1 : 0)} h`;
  if (days < 100) return `${days.toFixed(days < 10 ? 1 : 0)} days`;
  return `${(days / 365.25).toFixed(1)} years`;
}

/** "years of X": e.g. years of premium. */
export function fmtYears(years: number): string {
  if (!Number.isFinite(years)) return "∞ years";
  if (years < 1 / 12) return `${Math.max(1, Math.round(years * 365.25))} days`;
  if (years < 1) return `${Math.round(years * 12)} months`;
  if (years < 10) return `${years.toFixed(1)} years`;
  return `${Math.round(years).toLocaleString("en-US")} years`;
}

export function fmtPct(x: number, digits = 0): string {
  return `${(x * 100).toFixed(digits)}%`;
}
