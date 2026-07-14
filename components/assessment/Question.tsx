import { VbButton } from "@components/ui/VbButton";
import { QUESTIONS } from "@lib/assessment/questions";
import { SLICES } from "@lib/rubric";
import type { SliceColor, SliceId } from "@lib/rubric/types";
import {
  BackButton,
  OptionBody,
  OptionButton,
  OptionCheck,
  OptionLabel,
  OptionList,
  OptionSub,
  QuestionCount,
  QuestionHelper,
  QuestionRefLink,
  QuestionRefs,
  QuestionRisk,
  QuestionRiskBody,
  QuestionRiskHead,
  QuestionRoot,
  QuestionSlice,
  QuestionTitle,
  QuestionTop,
  ResultsActions,
  RiskDot,
} from "./stitches";

type QuestionProps = {
  sliceId: SliceId;
  value?: SliceColor;
  onChoose: (sliceId: SliceId, color: SliceColor) => void;
  index: number;
  total: number;
  onBack?: () => void;
  /** Shown when revisiting a slice after all six are answered */
  onShowResults?: () => void;
};

export function Question({
  sliceId,
  value,
  onChoose,
  index,
  total,
  onBack,
  onShowResults,
}: QuestionProps) {
  const data = QUESTIONS[sliceId];
  const slice = SLICES.find((s) => s.id === sliceId)!;

  return (
    <QuestionRoot>
      <QuestionTop>
        <QuestionCount>
          Slice {index + 1} of {total}
        </QuestionCount>
        <QuestionSlice>{slice.label}</QuestionSlice>
      </QuestionTop>
      <QuestionTitle>{data.q}</QuestionTitle>
      {data.helper && <QuestionHelper>{data.helper}</QuestionHelper>}
      <OptionList>
        {data.options.map((o) => {
          const sel = value === o.color;
          return (
            <OptionButton
              key={o.color}
              type="button"
              selected={sel}
              color={o.color}
              aria-pressed={sel}
              onClick={() => onChoose(sliceId, o.color)}
            >
              <RiskDot color={o.color} size="lg" />
              <OptionBody>
                <OptionLabel>{o.label}</OptionLabel>
                {o.sub && <OptionSub>{o.sub}</OptionSub>}
              </OptionBody>
              <OptionCheck selected={sel} aria-hidden="true">
                {sel ? "✓" : ""}
              </OptionCheck>
            </OptionButton>
          );
        })}
      </OptionList>
      {(data.risk || (data.references && data.references.length > 0)) && (
        <QuestionRisk>
          {data.risk && (
            <>
              <QuestionRiskHead>Why this matters</QuestionRiskHead>
              <QuestionRiskBody>{data.risk}</QuestionRiskBody>
            </>
          )}
          {data.references && data.references.length > 0 && (
            <QuestionRefs>
              {data.references.map((r) => (
                <QuestionRefLink
                  key={r.url + r.label}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {r.label} ↗
                </QuestionRefLink>
              ))}
            </QuestionRefs>
          )}
        </QuestionRisk>
      )}
      {onBack && (
        <BackButton type="button" onClick={onBack}>
          ← Back
        </BackButton>
      )}
      {onShowResults && (
        <ResultsActions>
          <VbButton onClick={onShowResults}>View my results →</VbButton>
        </ResultsActions>
      )}
    </QuestionRoot>
  );
}
