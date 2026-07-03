import { SLICES, STAGE_META, computeStage } from "@lib/rubric";
import type { Answers } from "@lib/rubric/types";

export function shareOgMeta(answers: Answers) {
  const stage = computeStage(answers);
  if (stage == null) {
    return {
      title: "Validator Security Result",
      description: SITE_FALLBACK_DESC,
    };
  }

  const sliceLine = SLICES.map((s) => {
    const c = answers[s.id];
    return c ? `${s.short}: ${c}` : `${s.short}: —`;
  }).join(" · ");

  return {
    title: `${STAGE_META[stage].name} · ${STAGE_META[stage].kind}`,
    description: `${sliceLine}. Self-assessed validator security on ValidatorBeat.com`,
  };
}

const SITE_FALLBACK_DESC =
  "Is your Ethereum validator secure and resilient? Take this self-assessment to find out.";
