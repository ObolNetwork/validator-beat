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
import { Intro } from "./Intro";
import { Setup } from "./Setup";
import { Results } from "./Results";
import { Lockout } from "./Lockout";
import { Incident } from "./Incident";
import { Outcomes } from "./Outcomes";
import { Timeline } from "./Timeline";
import { AheadMap, Odds } from "./Odds";
import { AdvancedCTA } from "./AdvancedCTA";
import { Assumptions } from "./Assumptions";
import { HowItWorks } from "./HowItWorks";
import { References } from "./refs";
import { AskAnAgent } from "@components/agents/AskAnAgent";
import { costPrompt } from "@lib/agents/prompts";
import * as s from "./styles";

/** Sections that only exist in the Advanced view; a link to one switches views. */
const ADVANCED_IDS = /^(incident|outcome|outcomes|timeline|odds|fan-chart|assumptions|how-calculated|queues|formulas|correlation-window|simplified-model|limits)/;

export function CostOfFailure() {
  const { params, update, replace, reset } = useCostParams();
  const advanced = params.view === "advanced";
  const cases = useMemo(() => outcomeCases(params), [params]);
  const econ = useMemo(() => economics(params), [params]);
  const probabilities = useMemo(() => outcomeProbabilities(params), [params]);
  const focusCase = cases.find((c) => c.id === params.focus) ?? cases[2];
  // The heatmap is in both views, so the simulation always runs (in a worker).
  const { mc, heatmap, running } = useSimulation(params);

  // Charts size themselves after hydration, which moves the page under the
  // browser's initial jump to #fragment, so jump again once they've laid out.
  // A link into an Advanced-only section opens the Advanced view first.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;
    if (!document.getElementById(id) && ADVANCED_IDS.test(id)) update({ view: "advanced" });
    const t = window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ block: "start" }), 500);
    return () => window.clearTimeout(t);
  }, [update]);

  const openAdvanced = (anchor = "odds") => {
    update({ view: "advanced" });
    window.setTimeout(() => document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
  };

  return (
    <Box css={{ minHeight: "100vh", backgroundColor: "$bg01", color: "$textMiddle" }}>
      <SiteHeader />
      {/* Anchored headings land below the sticky header with the chart in view. */}
      <Box as="main" id="main-content" css={{ "& [id]": { scrollMarginTop: 84 } }}>
        <Intro params={params} update={update} />

        <Box css={{ ...s.wrap, paddingBottom: 28 }}>
          <Box
            css={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
              gap: 22,
              alignItems: "start",
              "@media (max-width: 900px)": { gridTemplateColumns: "minmax(0, 1fr)" },
            }}
          >
            <Box css={{ display: "flex", flexDirection: "column", gap: 22 }}>
              <Setup params={params} update={update} replace={replace} probabilities={probabilities} />
              {/* Basic: the short lockout caveat fills the column beside the taller Results. */}
              {!advanced && <Lockout compact />}
            </Box>
            <Box css={{ position: "sticky", top: 84, "@media (max-width: 900px)": { position: "static" } }}>
              <Results params={params} econ={econ} cases={cases} />
            </Box>
          </Box>
          <Box css={{ marginTop: 22 }}>
            <AheadMap params={params} update={update} heatmap={heatmap} />
          </Box>
          {advanced && (
            <Box css={{ marginTop: 22 }}>
              <Lockout />
            </Box>
          )}
          {!advanced && (
            <Box css={{ marginTop: 22 }}>
              <AdvancedCTA onClick={() => openAdvanced("incident")} />
            </Box>
          )}
        </Box>

        {advanced && (
          <>
            <Incident params={params} update={update} focusCase={focusCase} econ={econ} />
            <Outcomes params={params} cases={cases} econ={econ} probabilities={probabilities} onFocus={(focus) => update({ focus })} />
            <Timeline params={params} focusCase={focusCase} />
            <Odds params={params} mc={mc} running={running} econ={econ} />
            <Assumptions params={params} update={update} replace={replace} reset={reset} cases={cases} mc={mc} />
            <HowItWorks />
          </>
        )}

        <Box as="section" css={{ ...s.section, paddingTop: advanced ? 56 : 24 }} aria-label="Next steps and references">
          <Box css={s.wrap}>

            <Box
              css={{
                marginTop: advanced ? 28 : 0,
                padding: "26px 28px",
                borderRadius: 14,
                border: "1px solid $bg05",
                backgroundColor: "$bg02",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 18,
                flexWrap: "wrap",
              }}
            >
              <Box>
                <Text as="h2" css={{ ...s.h3, fontSize: 22 }}>
                  Which stage is your validator at?
                </Text>
                <Text css={{ ...s.small, fontSize: "$2", marginTop: 4 }}>Six questions, about a minute, nothing stored.</Text>
              </Box>
              <Box
                as={NextLink}
                href={ASSESS_PATH}
                css={{
                  display: "inline-flex",
                  fontSize: "$3",
                  fontWeight: "$semibold",
                  textDecoration: "none",
                  borderRadius: "$3",
                  padding: "12px 22px",
                  backgroundColor: "var(--theme-brand)",
                  color: "var(--theme-text-on-brand)",
                  "&:hover": { backgroundColor: "var(--theme-brand-hover)" },
                }}
              >
                Assess your validator →
              </Box>
            </Box>
            <AskAnAgent
              prompt={costPrompt()}
              title="Prefer to ask your AI?"
              lede="Paste this into ChatGPT, Claude, or any assistant that can read a URL. It will ask for your numbers and build you a pre-filled link."
              css={{ marginTop: 28 }}
            />
            <References />
          </Box>
        </Box>
      </Box>
      <SiteFooter />
    </Box>
  );
}
