"use client";

import { useEffect, useState } from "react";
import { Pizza } from "@components/pizza/Pizza";
import { useAssessment } from "@hooks/useAssessment";
import { vbConfetti } from "@lib/confetti";
import { SLICES, allAnswered, computeStage, decodeShareCode, shareCode } from "@lib/rubric";
import type { SliceColor, SliceId } from "@lib/rubric/types";
import { VbButton } from "@components/ui/VbButton";
import { getShareUrl, shareNameFromQuery } from "@constants/index";
import { CONFETTI_BRAND } from "@lib/theme/tokens";
import {
  Blockers,
  BlockersHint,
  Legend,
  pizzaOrigin,
} from "./Blockers";
import { Intro } from "./Intro";
import { Question } from "./Question";
import { LevelUp, ResultHero, ShareModal } from "./Results";
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
  const [share, setShare] = useState(false);
  const [shareName, setShareName] = useState("");
  const active = a.atIntro || a.atResults ? null : a.current.id;

  useEffect(() => {
    document.body.style.overflow = "hidden";

    if (initialShareCode) {
      const decoded = decodeShareCode(initialShareCode.toUpperCase());
      if (decoded && computeStage(decoded) !== null) {
        a.hydrate(decoded);
      }
    }

    setShareName(shareNameFromQuery(window.location.search));

    return () => {
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate once on mount
  }, [initialShareCode]);

  const choose = (id: SliceId, color: SliceColor) => {
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

  const shareUrl =
    a.stage != null ? getShareUrl(shareCode(a.answers), shareName) : "";

  return (
    <Shell>
      <SiteHeader contentWidth={1440} />

      <MainGrid>
        <LeftCard>
          {a.atIntro ? (
            <Intro onStart={a.start} />
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
              <ResultHero stage={a.stage} answers={a.answers} ownerName={shareName} />
              <SectionLabel>
                {a.stage === 2 ? "Your perfect score" : "Your progress"}
              </SectionLabel>
              <LevelUp answers={a.answers} stage={a.stage} />
              <ResultsActions>
                <VbButton onClick={() => setShare(true)}>Share my pizza →</VbButton>
                <VbButton variant="secondary" onClick={a.reset}>
                  Start over
                </VbButton>
              </ResultsActions>
            </>
          ) : null}
        </LeftCard>

        <RightCard data-pizza-panel>
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
          onClose={() => setShare(false)}
        />
      )}
    </Shell>
  );
}
