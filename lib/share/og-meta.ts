import { SLICES, computeStage } from "@lib/rubric";
import type { Answers, Stage } from "@lib/rubric/types";

const STAGE_KIND: Record<Stage, string> = {
  0: "Getting started",
  1: "Safety",
  2: "Liveness",
};

const COLOR_WORD = { green: "green", yellow: "yellow", red: "red" } as const;

export function shareOgMeta(answers: Answers) {
  const stage = computeStage(answers);
  if (stage == null) {
    return {
      title: "Validator result",
      description: SITE_FALLBACK_DESC,
    };
  }

  const sliceLine = SLICES.map((s) => {
    const c = answers[s.id];
    return c ? `${s.short}: ${COLOR_WORD[c]}` : `${s.short}: —`;
  }).join(" · ");

  return {
    title: `Stage ${stage} · ${STAGE_KIND[stage]}`,
    description: `${sliceLine}. Self-assessed validator resilience on Validator Beat.`,
  };
}

const SITE_FALLBACK_DESC =
  "Six-slice validator resilience self-assessment — nothing stored.";
