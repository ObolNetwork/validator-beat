/// <reference lib="webworker" />
import { heatmap, simulate } from "@lib/cost/montecarlo";
import { sanitizeParams, type CostParams } from "@lib/cost/params";

export interface SimRequest {
  id: number;
  params: CostParams;
}

function isRequest(d: unknown): d is SimRequest {
  return (
    typeof d === "object" &&
    d !== null &&
    typeof (d as SimRequest).id === "number" &&
    typeof (d as SimRequest).params === "object" &&
    (d as SimRequest).params !== null
  );
}

self.onmessage = (e: MessageEvent<unknown>) => {
  // A dedicated worker only hears from the page that created it, whose
  // messages carry an empty origin (or our own). Reject anything else, and
  // anything that isn't a well-formed request.
  if (e.origin && e.origin !== self.location.origin) return;
  if (!isRequest(e.data)) return;
  const { id } = e.data;
  // Re-clamp: the simulation's cost scales with runs × years × operators.
  const params = sanitizeParams(e.data.params);
  const mc = simulate(params);
  (self as DedicatedWorkerGlobalScope).postMessage({ id, kind: "mc", mc });
  const hm = heatmap(params);
  (self as DedicatedWorkerGlobalScope).postMessage({ id, kind: "heatmap", heatmap: hm });
};
