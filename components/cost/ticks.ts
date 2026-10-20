/** Round axis ticks: steps of 1, 2 or 5 × 10ⁿ covering [min, max]. */
export function niceTicks(min: number, max: number, target = 5): { ticks: number[]; lo: number; hi: number } {
  const span = Math.max(max - min, 1e-9);
  const raw = span / target;
  const e = Math.pow(10, Math.floor(Math.log10(raw)));
  const m = raw / e;
  const step = (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * e;
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = lo; v <= hi + step / 2; v += step) ticks.push(Math.abs(v) < step / 1e6 ? 0 : v);
  return { ticks, lo, hi };
}
