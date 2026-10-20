import { useCallback, useEffect, useRef, useState } from "react";
import { DEFAULT_PARAMS, decodeParams, encodeParams, type CostParams } from "@lib/cost/params";

/**
 * Page state, mirrored into the URL query so any view can be shared. The
 * static export renders the defaults; the URL is read after hydration.
 */
export function useCostParams() {
  const [params, setParams] = useState<CostParams>(DEFAULT_PARAMS);
  const hydrated = useRef(false);

  useEffect(() => {
    setParams(decodeParams(window.location.search));
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    const t = window.setTimeout(() => {
      const q = encodeParams(params);
      const url = `${window.location.pathname}${q ? `?${q}` : ""}${window.location.hash}`;
      window.history.replaceState(window.history.state, "", url);
    }, 250);
    return () => window.clearTimeout(t);
  }, [params]);

  const update = useCallback((patch: Partial<CostParams>) => setParams((p) => ({ ...p, ...patch })), []);
  const replace = useCallback((next: CostParams | ((p: CostParams) => CostParams)) => setParams(next), []);
  const reset = useCallback((keys?: (keyof CostParams)[]) => {
    setParams((p) => {
      if (!keys) return DEFAULT_PARAMS;
      const next = { ...p };
      for (const k of keys) (next as Record<string, unknown>)[k] = DEFAULT_PARAMS[k];
      return next;
    });
  }, []);

  return { params, update, replace, reset };
}
