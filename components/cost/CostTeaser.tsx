import { Box, Text } from "@obolnetwork/obol-ui";
import NextLink from "next/link";
import type { CSS } from "@stitches/react";
import { Card, Eyebrow } from "@components/assessment/stitches";
import { IconArrowRight } from "@components/landing/icons";
import { COST_PATH } from "@constants/index";
import { fmtEth, fmtUsd, fmtYears } from "@lib/cost/format";
import { DEFAULT_PARAMS } from "@lib/cost/params";
import { economics, outcomeCases } from "@lib/cost/model";
import * as s from "./styles";

const CELLS = 200;

/** 200 cells = the whole stake; filled area is the loss, to scale. */
function Waffle({ loss, stake, color, label }: { loss: number; stake: number; color: string; label: string }) {
  const per = stake / CELLS;
  const full = Math.floor(loss / per);
  const part = loss / per - full;
  return (
    <Box
      role="img"
      aria-label={`${label}: ${fmtEth(loss)} of ${fmtEth(stake)}, to scale`}
      css={{ display: "grid", gridTemplateColumns: "repeat(20, 1fr)", gap: 3, maxWidth: 300 }}
    >
      {Array.from({ length: CELLS }, (_, i) => {
        const fill = i < full ? 1 : i === full ? part : 0;
        // Area-true: a partial cell is a square whose area is the fraction.
        const side = fill >= 1 ? 100 : Math.max(Math.sqrt(fill) * 100, 16);
        return (
          <Box
            key={i}
            css={{
              aspectRatio: "1",
              borderRadius: 2,
              backgroundColor: "$bg04",
              position: "relative",
              overflow: "hidden",
              // Ring the partial cell so a loss smaller than one square is findable.
              boxShadow: fill > 0 && fill < 1 && full === 0 ? `0 0 0 2px ${color}` : "none",
            }}
          >
            {fill > 0 && (
              <Box
                css={{
                  position: "absolute",
                  inset: 0,
                  width: `${side}%`,
                  height: `${side}%`,
                  backgroundColor: color,
                  borderRadius: 1,
                }}
              />
            )}
          </Box>
        );
      })}
    </Box>
  );
}

const ctaCss: CSS = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  fontSize: "$3",
  fontWeight: "$semibold",
  textDecoration: "none",
  whiteSpace: "nowrap",
  borderRadius: "$3",
  padding: "12px 22px",
  backgroundColor: "var(--theme-brand)",
  color: "var(--theme-text-on-brand)",
  "&:hover": { backgroundColor: "var(--theme-brand-hover)" },
};

// Computed at build time from the page's defaults, so the teaser and the page agree.
const P = DEFAULT_PARAMS;
const FULL = outcomeCases(P).find((c) => c.id === "full")!;
const ECON = economics(P);
const LOSS0 = FULL.stage0.breakdown.totalEth;
const LOSS1 = FULL.stage1.breakdown.totalEth;

/** Landing-page hook into /cost-of-failure. */
export function CostTeaser() {
  return (
    <Box as="section" css={{ ...s.section, paddingTop: 0 }} aria-labelledby="cost-teaser-h">
      <Box css={s.wrap}>
        <Card
          css={{
            padding: "40px 40px 36px",
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
            gap: 44,
            alignItems: "center",
            borderColor: "var(--vb-red-b)",
            "@media (max-width: 900px)": { gridTemplateColumns: "minmax(0, 1fr)", padding: 24, gap: 30 },
          }}
        >
          <Box>
            <Eyebrow as="p" css={{ margin: "0 0 14px", color: s.LINK }}>
              What one failure costs
            </Eyebrow>
            <Text as="h2" id="cost-teaser-h" css={s.h2}>
              One leaked key.{" "}
              <Text as="span" css={{ display: "inline", color: "var(--vb-red)" }}>
                {fmtEth(LOSS0)}
              </Text>{" "}
              gone.
            </Text>
            <Text as="p" css={{ ...s.prose, fontSize: "$4" }}>
              A key compromise at an operator running {P.operatorSharePct}% of the network. The attacker slashes every key
              before it can exit. On a {fmtEth(P.stakeEth)} stake at Stage 0, that costs{" "}
              <strong>
                {fmtEth(LOSS0)} ({fmtUsd(LOSS0 * P.ethUsd)})
              </strong>
              . At Stage 1 no single key can sign, so the same leak means replacing one key-holder:{" "}
              <strong>about {fmtEth(LOSS1)}</strong>.
            </Text>
            <Text as="p" css={s.prose}>
              Stage 1 can cost twice the fees, {P.fee1Pct}% of rewards instead of {P.fee0Pct}%. This one event would cover{" "}
              <strong>{fmtYears(LOSS0 / ECON.premiumPerYearEth)}</strong> of that difference.
            </Text>
            <Box css={{ marginTop: 26 }}>
              <Box as={NextLink} href={COST_PATH} css={ctaCss}>
                Run the numbers for your stake <IconArrowRight size={16} />
              </Box>
            </Box>
          </Box>
          <Box css={{ display: "flex", gap: 28, justifyContent: "center", flexWrap: "wrap" }}>
            <Box css={{ display: "flex", flexDirection: "column", gap: 10, flex: "1 1 200px", maxWidth: 300 }}>
              <Text css={{ fontSize: "$1", fontWeight: "$bold", textTransform: "uppercase", letterSpacing: "0.05em", color: "$textMiddle" }}>
                <Box as="span" css={s.swatch(s.S0)} />
                Stage 0 · {fmtEth(LOSS0)}
              </Text>
              <Waffle loss={LOSS0} stake={P.stakeEth} color={s.S0} label="Stage 0 loss" />
            </Box>
            <Box css={{ display: "flex", flexDirection: "column", gap: 10, flex: "1 1 200px", maxWidth: 300 }}>
              <Text css={{ fontSize: "$1", fontWeight: "$bold", textTransform: "uppercase", letterSpacing: "0.05em", color: "$textMiddle" }}>
                <Box as="span" css={s.swatch(s.S1)} />
                Stage 1 · {fmtEth(LOSS1)}
              </Text>
              <Waffle loss={LOSS1} stake={P.stakeEth} color={s.S1} label="Stage 1 loss" />
            </Box>
            <Text css={{ ...s.small, flexBasis: "100%", textAlign: "center" }}>
              Each square is {fmtEth(P.stakeEth / CELLS)} of a {fmtEth(P.stakeEth)} stake, to scale. Stage 1&apos;s loss is a
              fraction of one square.
            </Text>
          </Box>
        </Card>
      </Box>
    </Box>
  );
}
