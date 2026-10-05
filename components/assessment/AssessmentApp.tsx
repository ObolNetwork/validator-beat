"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Pizza } from "@components/pizza/Pizza";
import { useAssessment } from "@hooks/useAssessment";
import { vbConfetti } from "@lib/confetti";
import { SLICES, STAGE_META, allAnswered, computeStage, decodeShareCode, shareCode } from "@lib/rubric";
import type { SliceColor, SliceId } from "@lib/rubric/types";
import { VbButton } from "@components/ui/VbButton";
import { SITE_NAME } from "@constants/index";
import {
  type CompareTarget,
  compareAssessPath,
  getShareUrl,
  parseShareQuery,
} from "@lib/share/share-url";
import { Box } from "@obolnetwork/obol-ui";
import { CONFETTI_BRAND } from "@lib/theme/tokens";
import {
  Blockers,
  BlockersHint,
  Legend,
  pizzaOrigin,
} from "./Blockers";
import { CompareCard } from "./Compare";
import { Intro } from "./Intro";
import { Question } from "./Question";
import { LevelUp, ResultHero, ShareModal } from "./Results";
import { AskAnAgent } from "@components/agents/AskAnAgent";
import { assessPrompt, resultPrompt } from "@lib/agents/prompts";
import { SiteHeader } from "@components/layout/SiteHeader";
import { SiteFooter } from "@components/layout/SiteFooter";
import {
  LeftCard,
  MainGrid,
  PizzaWrap,
  ResultsActions,
  RightCard,
  RightPanel,
  SectionLabel,
  Shell,
} from "./stitches";

type AssessmentAppProps = {
  initialShareCode?: string;
};

export function AssessmentApp({ initialShareCode }: AssessmentAppProps) {
  const a = useAssessment();
  const router = useRouter();
  const [share, setShare] = useState(false);
  const [shareName, setShareName] = useState("");
  /** Opened from someone's share link and not yet edited — the result isn't the viewer's own. */
  const [guest, setGuest] = useState(Boolean(initialShareCode));
  const [compare, setCompare] = useState<CompareTarget | null>(null);
  const active = a.atIntro || a.atResults ? null : a.current.id;

  useEffect(() => {
    document.body.style.overflow = "hidden";

    if (initialShareCode) {
      const decoded = decodeShareCode(initialShareCode.toUpperCase());
      if (decoded && computeStage(decoded) !== null) {
        a.hydrate(decoded);
      }
    }

    const q = parseShareQuery(window.location.search);
    if (initialShareCode) setShareName(q.name);
    setCompare(q.compare);

    return () => {
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate once on mount
  }, [initialShareCode]);

  const choose = (id: SliceId, color: SliceColor) => {
    setGuest(false);
    if (color === "green") {
      const idx = SLICES.findIndex((s) => s.id === id);
      const o = pizzaOrigin(idx);
      vbConfetti({
        x: o.x,
        y: o.y,
        count: 40,
        power: 0.9,
        colors: CONFETTI_BRAND,
      });
    }
    a.choose(id, color);
  };

  const { atResults, stage, answers, takeResultsConfetti } = a;

  useEffect(() => {
    if (!atResults || stage == null) return;
    if (!takeResultsConfetti()) return;
    const greens = SLICES.filter((s) => answers[s.id] === "green").length;
    if (greens === 0) return;
    const big = stage === 2;
    const frame = requestAnimationFrame(() => {
      const o = pizzaOrigin(null);
      vbConfetti({
        x: o.x,
        y: o.y,
        count: big ? 150 : 40 + greens * 18,
        power: big ? 1.2 : 0.95,
      });
      if (big) {
        setTimeout(
          () => vbConfetti({ x: o.x, y: o.y, count: 80, power: 1.05 }),
          240,
        );
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [atResults, stage, answers, takeResultsConfetti]);

  const code = a.stage != null ? shareCode(a.answers) : "";
  const shareUrl = code ? getShareUrl(code, shareName, compare) : "";

  const compareAnswers = useMemo(
    () => (compare ? decodeShareCode(compare.code) : null),
    [compare],
  );
  const compareStage = compareAnswers ? computeStage(compareAnswers) : null;
  const theirLabel = compare?.name || "Their setup";
  const myLabel = guest ? shareName || "This setup" : "You";
  const compareLine =
    compare && a.stage != null && compareStage != null
      ? `${guest ? myLabel : shareName || "My validator"} is ${STAGE_META[a.stage].name}; ${theirLabel} is ${STAGE_META[compareStage].name} — compared on Validator Beat.`
      : undefined;

  // Static pages can't know ?n=, so name the tab client-side once we can.
  useEffect(() => {
    if (!guest || !shareName || a.stage == null) return;
    document.title = `${shareName} is ${STAGE_META[a.stage].name} | ${SITE_NAME}`;
  }, [guest, shareName, a.stage]);

  // The intro is also the server-rendered state, so a share page's static HTML
  // carries its own result prompt for agents reading the DOM.
  const promptCode = a.atResults ? code : a.atIntro ? initialShareCode?.toUpperCase() : undefined;
  const askAgent = (a.atIntro || a.atResults) && (
    <AskAnAgent
      headingAs="h3"
      css={{ marginTop: 28 }}
      prompt={promptCode ? resultPrompt(promptCode) : assessPrompt()}
      title={promptCode ? "Ask your AI about this result" : "Or let your AI walk you through it"}
      lede={
        promptCode
          ? "Paste this into ChatGPT, Claude, or any assistant that can read a URL. Fill in the brackets first."
          : "Paste this into ChatGPT, Claude, or any assistant that can read a URL. It asks the same six questions and hands back your share link."
      }
    />
  );

  const takeItYourself = () => {
    router.push(compareAssessPath({ code, name: shareName }));
  };

  return (
    <Shell>
      <SiteHeader contentWidth={1440} />

      <MainGrid as="main" id="main-content">
        <Box
          as="h1"
          css={{
            position: "absolute",
            width: 1,
            height: 1,
            padding: 0,
            margin: -1,
            overflow: "hidden",
            clip: "rect(0 0 0 0)",
            whiteSpace: "nowrap",
            border: 0,
          }}
        >
          Validator self-assessment
        </Box>
        <LeftCard>
          {a.atIntro ? (
            <Intro
              onStart={a.start}
              compare={
                compare && compareStage != null
                  ? { name: theirLabel, stage: compareStage }
                  : undefined
              }
            />
          ) : !a.atResults ? (
            <Question
              sliceId={a.current.id}
              value={a.answers[a.current.id]}
              onChoose={choose}
              index={a.step}
              total={a.total}
              onBack={a.step === 0 ? a.toIntro : a.back}
              onShowResults={
                allAnswered(a.answers) ? a.showResults : undefined
              }
            />
          ) : a.stage != null ? (
            <>
              <ResultHero
                stage={a.stage}
                answers={a.answers}
                ownerName={shareName}
                guest={guest}
              />
              {guest && (
                <ResultsActions css={{ marginTop: 0, marginBottom: 20 }}>
                  <VbButton onClick={takeItYourself}>
                    {compareAnswers ? "Take it yourself →" : "Take it yourself & compare →"}
                  </VbButton>
                  <VbButton variant="secondary" onClick={() => setShare(true)}>
                    Share this result
                  </VbButton>
                </ResultsActions>
              )}
              {compareAnswers && (
                <CompareCard
                  left={{ label: myLabel, answers: a.answers }}
                  right={{ label: theirLabel, answers: compareAnswers }}
                />
              )}
              <SectionLabel>
                {a.stage === 2 ? "Perfect score" : guest ? "Progress" : "Your progress"}
              </SectionLabel>
              <LevelUp answers={a.answers} stage={a.stage} guest={guest} />
              {!guest && (
                <ResultsActions>
                  <VbButton onClick={() => setShare(true)}>
                    {compareAnswers ? "Share the head-to-head →" : "Share my pizza →"}
                  </VbButton>
                  <VbButton variant="secondary" onClick={a.reset}>
                    Start over
                  </VbButton>
                </ResultsActions>
              )}
            </>
          ) : null}
          {askAgent}
        </LeftCard>

        {/* On phones the pizza leads, except on a shared link, where the name and stage should. */}
        <RightCard
          data-pizza-panel
          css={guest ? { "@media (max-width: 880px)": { order: 0 } } : undefined}
        >
          <PizzaWrap>
            <Pizza
              answers={a.answers}
              size={320}
              active={active}
              stage={a.stage}
              onSlice={(id) => a.goto(SLICES.findIndex((s) => s.id === id))}
            />
          </PizzaWrap>
          <RightPanel>
            {a.atIntro ? (
              <BlockersHint />
            ) : (
              <Blockers answers={a.answers} stage={a.stage} />
            )}
          </RightPanel>
          <Legend />
        </RightCard>
      </MainGrid>

      <SiteFooter contentWidth={1440} />

      {share && a.stage != null && (
        <ShareModal
          answers={a.answers}
          stage={a.stage}
          shareUrl={shareUrl}
          ownerName={shareName}
          onOwnerNameChange={setShareName}
          compareLine={compareLine}
          onClose={() => setShare(false)}
        />
      )}
    </Shell>
  );
}
