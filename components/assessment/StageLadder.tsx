import React from "react";
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

const LADDER = [
  {
    n: 0 as const,
    name: "Stage 0",
    kind: "Getting started",
    tag: "Has a single point of failure",
    tone: "red" as const,
  },
  {
    n: 1 as const,
    name: "Stage 1",
    kind: "Safety",
    tag: "No single party can slash you",
    tone: "yellow" as const,
  },
  {
    n: 2 as const,
    name: "Stage 2",
    kind: "Liveness",
    tag: "No single failure can stop or censor you",
    tone: "green" as const,
  },
];

type StageLadderProps = {
  stage: Stage | null;
  vertical?: boolean;
};

export function StageLadder({ stage, vertical = false }: StageLadderProps) {
  return (
    <Ladder vertical={vertical}>
      {LADDER.map((s, i) => (
        <React.Fragment key={s.n}>
          <LadderCell
            tone={s.tone}
            current={stage === s.n}
            passed={stage != null && stage > s.n}
            vertical={vertical}
          >
            <LadderRow>
              <LadderName tone={s.tone}>{s.name}</LadderName>
              <LadderKind tone={s.tone}>{s.kind}</LadderKind>
              {stage === s.n && <LadderHere tone={s.tone}>you&apos;re here</LadderHere>}
              {stage != null && stage > s.n && (
                <LadderCheck tone={s.tone}>✓</LadderCheck>
              )}
            </LadderRow>
            <LadderTag>{s.tag}</LadderTag>
          </LadderCell>
          {i < 2 && (
            <LadderArrow vertical={vertical}>{vertical ? "↓" : "→"}</LadderArrow>
          )}
        </React.Fragment>
      ))}
    </Ladder>
  );
}
