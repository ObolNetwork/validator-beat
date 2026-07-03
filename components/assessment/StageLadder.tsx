import React from "react";
import { STAGE_META } from "@lib/rubric";
import type { Stage } from "@lib/rubric/types";
import {
  Ladder,
  LadderArrow,
  LadderCell,
  LadderCheck,
  LadderHere,
  LadderKind,
  LadderName,
  LadderRow,
  LadderTag,
} from "./stitches";

const STAGE_ORDER: Stage[] = [0, 1, 2];

type StageLadderProps = {
  stage: Stage | null;
  vertical?: boolean;
};

export function StageLadder({ stage, vertical = false }: StageLadderProps) {
  return (
    <Ladder vertical={vertical}>
      {STAGE_ORDER.map((n, i) => {
        const meta = STAGE_META[n];
        return (
          <React.Fragment key={n}>
            <LadderCell
              tone={meta.tone}
              current={stage === n}
              passed={stage != null && stage > n}
              vertical={vertical}
            >
              <LadderRow>
                <LadderName tone={meta.tone}>{meta.name}</LadderName>
                <LadderKind tone={meta.tone}>{meta.kind}</LadderKind>
                {stage === n && (
                  <LadderHere tone={meta.tone}>you&apos;re here</LadderHere>
                )}
                {stage != null && stage > n && (
                  <LadderCheck tone={meta.tone}>✓</LadderCheck>
                )}
              </LadderRow>
              <LadderTag>{meta.tagline}</LadderTag>
            </LadderCell>
            {i < STAGE_ORDER.length - 1 && (
              <LadderArrow vertical={vertical}>{vertical ? "↓" : "→"}</LadderArrow>
            )}
          </React.Fragment>
        );
      })}
    </Ladder>
  );
}
