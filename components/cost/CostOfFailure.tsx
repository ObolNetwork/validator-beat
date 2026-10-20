import { Box, Text } from "@obolnetwork/obol-ui";
import NextLink from "next/link";
import { useEffect, useMemo } from "react";
import { SiteHeader } from "@components/layout/SiteHeader";
import { SiteFooter } from "@components/layout/SiteFooter";
import { ASSESS_PATH } from "@constants/index";
import { economics, outcomeCases } from "@lib/cost/model";
import { outcomeProbabilities } from "@lib/cost/montecarlo";
import { useCostParams } from "./useCostParams";
import { useSimulation } from "./useSimulation";
import { Hero } from "./Hero";
import { Outcomes } from "./Outcomes";
import { Timeline } from "./Timeline";
import { Odds } from "./Odds";
import { Assumptions } from "./Assumptions";
import { HowItWorks } from "./HowItWorks";
import * as s from "./styles";

export function CostOfFailure() {
  const { params, update, replace, reset } = useCostParams();
  const cases = useMemo(() => outcomeCases(params), [params]);
  const econ = useMemo(() => economics(params), [params]);
  const probabilities = useMemo(() => outcomeProbabilities(params), [params]);
  const focusCase = cases.find((c) => c.id === params.focus) ?? cases[2];
  const { mc, heatmap, running } = useSimulation(params);

  // Charts size themselves after hydration, which moves the page under the
  // browser's initial jump to #fragment, so jump again once they've laid out.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;
    const t = window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ block: "start" }), 400);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <Box css={{ minHeight: "100vh", backgroundColor: "$bg01", color: "$textMiddle" }}>
      <SiteHeader />
      {/* Anchored headings land below the sticky header with the chart in view. */}
      <Box as="main" id="main-content" css={{ "& [id]": { scrollMarginTop: 84 } }}>
        <Hero params={params} update={update} focusCase={focusCase} econ={econ} />
        <Outcomes params={params} cases={cases} econ={econ} probabilities={probabilities} onFocus={(focus) => update({ focus })} />
        <Timeline params={params} focusCase={focusCase} />
        <Odds
          params={params}
          update={update}
          replace={replace}
          mc={mc}
          heatmap={heatmap}
          running={running}
          econ={econ}
          probabilities={probabilities}
        />
        <Assumptions params={params} update={update} replace={replace} reset={reset} cases={cases} mc={mc} />
        <HowItWorks />
        <Box as="section" css={{ ...s.section, textAlign: "center" }}>
          <Box css={s.wrap}>
            <Text as="h2" css={{ ...s.h2, maxWidth: "20ch", margin: "0 auto" }}>
              Which stage is your validator at?
            </Text>
            <Text as="p" css={{ ...s.prose, margin: "14px auto 0" }}>
              Six questions, about a minute, nothing stored.
            </Text>
            <Box
              as={NextLink}
              href={ASSESS_PATH}
              css={{
                display: "inline-flex",
                marginTop: 26,
                fontSize: "$4",
                fontWeight: "$semibold",
                textDecoration: "none",
                borderRadius: "$3",
                padding: "14px 28px",
                backgroundColor: "var(--theme-brand)",
                color: "var(--theme-text-on-brand)",
                "&:hover": { backgroundColor: "var(--theme-brand-hover)" },
              }}
            >
              Assess your validator →
            </Box>
          </Box>
        </Box>
      </Box>
      <SiteFooter />
    </Box>
  );
}
