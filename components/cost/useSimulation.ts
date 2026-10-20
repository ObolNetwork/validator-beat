import { useEffect, useRef, useState } from "react";
import { heatmap as runHeatmap, simulate, type Heatmap, type MonteCarloResult } from "@lib/cost/montecarlo";
import type { CostParams } from "@lib/cost/params";

/** Inputs that change the simulation (the hero's focus/partial view does not). */
function simKey(p: CostParams): string {
  const { focus: _f, partialPct: _p, outageHours: _o, heatView: _h, ...rest } = p;
  return JSON.stringify(rest);
}

/**
 * Runs the Monte Carlo and heatmap in a Web Worker (debounced), so dragging a
 * slider never blocks the page. Falls back to the main thread if workers are
 * unavailable.
 */
export function useSimulation(params: CostParams) {
  const [mc, setMc] = useState<MonteCarloResult | null>(null);
  const [hm, setHm] = useState<Heatmap | null>(null);
  const [running, setRunning] = useState(true);
  const worker = useRef<Worker | null>(null);
  const reqId = useRef(0);
  const key = simKey(params);
  const latest = useRef(params);
  latest.current = params;

  useEffect(() => {
    if (typeof Worker === "undefined") return;
    try {
      const w = new Worker(new URL("./simulation.worker.ts", import.meta.url));
      w.onmessage = (e: MessageEvent) => {
        if (e.data.id !== reqId.current) return;
        if (e.data.kind === "mc") setMc(e.data.mc);
        else {
          setHm(e.data.heatmap);
          setRunning(false);
        }
      };
      worker.current = w;
    } catch {
      worker.current = null;
    }
    return () => worker.current?.terminate();
  }, []);

  useEffect(() => {
    setRunning(true);
    const t = window.setTimeout(() => {
      const id = ++reqId.current;
      if (worker.current) {
        worker.current.postMessage({ id, params: latest.current });
      } else {
        setMc(simulate(latest.current));
        setHm(runHeatmap(latest.current));
        setRunning(false);
      }
    }, 200);
    return () => window.clearTimeout(t);
  }, [key]);

  return { mc, heatmap: hm, running };
}
