import { blockers } from "@lib/rubric";
import type { Answers, Stage } from "@lib/rubric/types";
import {
  BlockNames,
  BlockText,
  LegendItem,
  LegendRow,
  RiskDot,
} from "./stitches";

type BlockersProps = {
  answers: Answers;
  stage: Stage | null;
};

export function Blockers({ answers, stage }: BlockersProps) {
  if (stage == null) return null;
  const list = blockers(answers);
  if (stage === 2) {
    return (
      <BlockText win>
        Every slice green — maximum resilience. No single failure can slash you or take
        you offline.
      </BlockText>
    );
  }
  const target = stage === 0 ? "Stage 1" : "Stage 2";
  return (
    <BlockText>
      <b>{list.length}</b> {list.length === 1 ? "win" : "wins"} away from {target}:{" "}
      <BlockNames>{list.map((s) => s.short).join(", ")}</BlockNames>
    </BlockText>
  );
}

export function BlockersHint() {
  return <BlockText hint>Your pizza fills in as you answer →</BlockText>;
}

export function Legend() {
  return (
    <LegendRow>
      <LegendItem>
        <RiskDot color="green" size="sm" /> Green · no single point of failure
      </LegendItem>
      <LegendItem>
        <RiskDot color="yellow" size="sm" /> Yellow · partially mitigated
      </LegendItem>
      <LegendItem>
        <RiskDot color="red" size="sm" /> Red · single point of failure
      </LegendItem>
    </LegendRow>
  );
}

export function pizzaOrigin(sliceIndex: number | null): { x: number; y: number } {
  if (typeof document === "undefined") return { x: 0.76, y: 0.42 };
  const panel = document.querySelector("[data-pizza-panel]");
  const svg = panel?.querySelector(".vbpizza");
  if (!svg) return { x: 0.76, y: 0.42 };
  let el: Element = svg;
  if (sliceIndex != null) {
    const wedges = svg.querySelectorAll(".vbwedge");
    if (wedges[sliceIndex]) el = wedges[sliceIndex];
  }
  const r = el.getBoundingClientRect();
  return {
    x: (r.left + r.width / 2) / window.innerWidth,
    y: (r.top + r.height / 2) / window.innerHeight,
  };
}
