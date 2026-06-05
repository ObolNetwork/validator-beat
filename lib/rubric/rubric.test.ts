import {
  COLORS,
  SLICES,
  blockers,
  computeStage,
  decodeShareCode,
  shareCode,
} from "./index";
import type { Answers } from "./types";

const allGreen = (): Answers =>
  Object.fromEntries(SLICES.map((s) => [s.id, COLORS.green])) as Answers;

const allYellow = (): Answers =>
  Object.fromEntries(SLICES.map((s) => [s.id, COLORS.yellow])) as Answers;

describe("rubric v0.1", () => {
  it("all green → Stage 2", () => {
    expect(computeStage(allGreen())).toBe(2);
  });

  it("one red → Stage 0", () => {
    const a = allYellow();
    a.keyCustody = COLORS.red;
    expect(computeStage(a)).toBe(0);
  });

  it("all yellow, no red → Stage 1", () => {
    expect(computeStage(allYellow())).toBe(1);
  });

  it("incomplete → null stage", () => {
    expect(computeStage({ keyCustody: COLORS.green })).toBeNull();
  });

  it("shareCode encodes six slice colors", () => {
    expect(shareCode(allGreen())).toBe("GGGGGG");
    const mixed: Answers = {
      keyCustody: COLORS.green,
      clientDiversity: COLORS.yellow,
      infraDiversity: COLORS.red,
      osDiversity: COLORS.green,
      cpuDiversity: COLORS.yellow,
      geoDiversity: COLORS.green,
    };
    expect(shareCode(mixed)).toBe("GYRGYG");
  });

  it("blockers lists reds when Stage 0", () => {
    const a = allGreen();
    a.infraDiversity = COLORS.red;
    expect(blockers(a).map((s) => s.id)).toEqual(["infraDiversity"]);
  });

  it("decodeShareCode round-trips", () => {
    const code = shareCode(allGreen());
    expect(decodeShareCode(code)).toEqual(allGreen());
  });
});
