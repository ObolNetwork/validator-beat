/// <reference lib="webworker" />
import { heatmap, simulate } from "@lib/cost/montecarlo";
import type { CostParams } from "@lib/cost/params";

export interface SimRequest {
  id: number;
  params: CostParams;
}

self.onmessage = (e: MessageEvent<SimRequest>) => {
  const { id, params } = e.data;
  const mc = simulate(params);
  (self as DedicatedWorkerGlobalScope).postMessage({ id, kind: "mc", mc });
  const hm = heatmap(params);
  (self as DedicatedWorkerGlobalScope).postMessage({ id, kind: "heatmap", heatmap: hm });
};
