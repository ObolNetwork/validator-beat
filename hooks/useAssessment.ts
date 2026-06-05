import { useCallback, useRef, useState } from "react";
import { SLICES, computeStage } from "@lib/rubric";
import type { Answers, SliceColor, SliceId, Stage } from "@lib/rubric/types";

const ADVANCE_MS = 420;

export function useAssessment() {
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextResultsConfettiRef = useRef(false);

  const total = SLICES.length;
  const stage = computeStage(answers);
  const atIntro = !started;
  const atResults = started && step >= total;
  const current = SLICES[Math.min(step, total - 1)];

  const choose = useCallback(
    (sliceId: SliceId, color: SliceColor) => {
      const idx = SLICES.findIndex((s) => s.id === sliceId);
      if (timerRef.current) clearTimeout(timerRef.current);

      let alreadyAnswered = false;
      let nextAnswers: Answers = {};
      setAnswers((prev) => {
        alreadyAnswered = Boolean(prev[sliceId]);
        nextAnswers = { ...prev, [sliceId]: color };
        return nextAnswers;
      });

      timerRef.current = setTimeout(() => {
        setStep((cur) => {
          if (cur !== idx) return cur;
          const gap = SLICES.findIndex((s) => !nextAnswers[s.id]);
          if (alreadyAnswered) return gap >= 0 ? gap : cur;
          return gap >= 0 ? gap : total;
        });
      }, ADVANCE_MS);
    },
    [total],
  );

  const start = useCallback(() => setStarted(true), []);
  const back = useCallback(() => setStep((s) => Math.max(s - 1, 0)), []);
  const goto = useCallback((i: number) => {
    setStarted(true);
    setStep(Math.max(0, Math.min(i, total)));
  }, [total]);

  const showResults = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    skipNextResultsConfettiRef.current = true;
    setStarted(true);
    setStep(total);
  }, [total]);

  const takeResultsConfetti = useCallback(() => {
    if (skipNextResultsConfettiRef.current) {
      skipNextResultsConfettiRef.current = false;
      return false;
    }
    return true;
  }, []);

  const reset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setAnswers({});
    setStep(0);
    setStarted(false);
  }, []);

  const hydrate = useCallback((next: Answers) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setAnswers(next);
    setStarted(true);
    setStep(total);
  }, [total]);

  return {
    started,
    start,
    step,
    answers,
    stage: stage as Stage | null,
    total,
    choose,
    back,
    goto,
    showResults,
    takeResultsConfetti,
    reset,
    hydrate,
    atIntro,
    atResults,
    current,
  };
}

export type AssessmentState = ReturnType<typeof useAssessment>;
