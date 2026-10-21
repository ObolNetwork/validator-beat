import { Box, Text } from "@obolnetwork/obol-ui";
import { fmtEth, fmtUsd } from "@lib/cost/format";
import { useWidth } from "./useWidth";
import * as s from "./styles";

interface Side {
  label: string;
  sub: string;
  eth: number;
}

/**
 * Two losses as squares whose AREAS are to scale, nested in one corner so the
 * small one reads as a speck inside the big one. Unlike a log axis, nothing
 * is compressed: a 1,000× smaller loss looks 1,000× smaller.
 */
export function AreaCompare({ big, small, ethUsd, maxSide = 260 }: { big: Side; small: Side; ethUsd: number; maxSide?: number }) {
  const [ref, width] = useWidth<HTMLDivElement>(maxSide);
  const side = Math.min(maxSide, width);
  const ratio = small.eth > 0 ? big.eth / small.eth : Infinity;
  const smallSide = big.eth > 0 ? Math.max(side * Math.sqrt(small.eth / big.eth), 2) : 0;
  const times = !Number.isFinite(ratio) ? "∞" : ratio >= 100 ? Math.round(ratio).toLocaleString("en-US") : ratio.toFixed(ratio < 10 ? 1 : 0);

  return (
    <Box
      css={{
        display: "grid",
        gridTemplateColumns: `minmax(0, ${side}px) minmax(0, 1fr)`,
        gap: 22,
        alignItems: "end",
        "@media (max-width: 560px)": { gridTemplateColumns: "minmax(0, 1fr)" },
      }}
    >
      <Box ref={ref} css={{ maxWidth: maxSide, width: "100%" }}>
        <Box
          role="img"
          aria-label={`${big.label}: ${fmtEth(big.eth)}. ${small.label}: ${fmtEth(small.eth)}, ${times} times smaller. Areas to scale.`}
          css={{ position: "relative", width: side, height: side, backgroundColor: s.S0, borderRadius: 6 }}
        >
          <Box
            css={{
              position: "absolute",
              left: 0,
              bottom: 0,
              width: smallSide,
              height: smallSide,
              backgroundColor: s.S1,
              borderRadius: smallSide > 8 ? 3 : 1,
              // A surface ring keeps the speck visible against the big square.
              boxShadow: `0 0 0 2px ${s.SURFACE}`,
            }}
          />
        </Box>
        <Text css={{ ...s.small, fontSize: 11, marginTop: 6 }}>
          Areas to scale.{smallSide < 22 ? " The blue speck in the corner is the second loss." : ""}
        </Text>
      </Box>
      <Box css={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {([
          [big, s.S0],
          [small, s.S1],
        ] as const).map(([x, color]) => (
          <Box key={x.label}>
            <Text css={{ fontSize: "$1", fontWeight: "$bold", textTransform: "uppercase", letterSpacing: "0.05em", color: "$textMiddle" }}>
              <Box as="span" css={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, backgroundColor: color, marginRight: 7, verticalAlign: "-1px" }} />
              {x.label}
            </Text>
            <Text css={{ fontSize: 28, fontWeight: "$bold", letterSpacing: "-0.02em", color: "$body", fontVariantNumeric: "tabular-nums", marginTop: 4 }}>
              {fmtEth(x.eth)}
            </Text>
            <Text css={s.small}>
              {fmtUsd(x.eth * ethUsd)} · {x.sub}
            </Text>
          </Box>
        ))}
        <Text css={{ fontSize: "$3", fontWeight: "$semibold", color: "$body" }}>{times}× smaller</Text>
      </Box>
    </Box>
  );
}
