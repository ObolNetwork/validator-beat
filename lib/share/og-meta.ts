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
    title: `My validator is ${STAGE_META[stage].name} · ${STAGE_META[stage].kind}`,
    description: `${sliceLine}. What stage is yours? Rate any validator in 60 seconds on ValidatorBeat.com — free, nothing stored.`,
  };
}

const SITE_FALLBACK_DESC =
  "Is your Ethereum validator secure and resilient? Take this self-assessment to find out.";
