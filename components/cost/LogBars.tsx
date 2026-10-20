import { Box, Text } from "@obolnetwork/obol-ui";
import { fmtCompact, fmtEth } from "@lib/cost/format";
import { GRID, INK_2, S0, S1, SURFACE } from "./styles";

interface Row {
  key: string;
  label: string;
  value: number;
  color: string;
}

/**
 * Two magnitudes that differ by orders of magnitude, on a labelled log axis.
 * Each bar carries its value at the tip, and decade ticks are printed, so the
 * scale is explicit rather than a hidden square root.
 */
export function LogBars({ rows, min = 0.1, max }: { rows: Row[]; min?: number; max?: number }) {
  const top = max ?? Math.pow(10, Math.ceil(Math.log10(Math.max(...rows.map((r) => r.value), 10))));
  const lo = Math.log10(min);
  const hi = Math.log10(top);
  const x = (v: number) => ((Math.log10(Math.max(v, min)) - lo) / (hi - lo)) * 100;
  const ticks: number[] = [];
  for (let e = Math.ceil(lo); e <= hi; e++) ticks.push(Math.pow(10, e));

  return (
    <Box role="img" aria-label={rows.map((r) => `${r.label}: ${fmtEth(r.value)}`).join("; ") + " (log scale)"}>
      <Box css={{ display: "grid", gridTemplateColumns: "64px 1fr", rowGap: 10, columnGap: 12, alignItems: "center" }}>
        {rows.map((r) => (
          <Box key={r.key} css={{ display: "contents" }}>
            <Text css={{ fontSize: "$1", fontWeight: "$semibold", color: "$body" }}>{r.label}</Text>
            <Box css={{ position: "relative", height: 18 }}>
              <Box
                css={{
                  position: "absolute",
                  left: 0,
                  top: 2,
                  height: 14,
                  width: `max(3px, ${x(r.value)}%)`,
                  backgroundColor: r.color,
                  borderRadius: "0 4px 4px 0",
                }}
              />
            </Box>
          </Box>
        ))}
        <Box />
        <Box css={{ position: "relative", height: 18, borderTop: `1px solid ${GRID}` }}>
          {ticks.map((t) => (
            <Text
              key={t}
              css={{
                position: "absolute",
                left: `${x(t)}%`,
                top: 3,
                transform: "translateX(-50%)",
                fontSize: 11,
                color: INK_2,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {fmtCompact(t)}
            </Text>
          ))}
        </Box>
      </Box>
      <Text css={{ fontSize: 11, color: INK_2, marginTop: 2, textAlign: "right" }}>ETH, log scale: each tick is 10×</Text>
    </Box>
  );
}

export const STAGE_COLORS = { s0: S0, s1: S1, surface: SURFACE };
