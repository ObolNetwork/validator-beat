import { QUESTIONS } from "@lib/assessment/questions";
import {
  COLORS,
  SLICES,
  STAGE_META,
  allShareCodes,
  blockers,
  computeStage,
  decodeShareCode,
  getTip,
  shareCode,
  sliceChoices,
} from "./index";
import type { Answers, SliceColor } from "./types";

const all = (color: SliceColor): Answers =>
  Object.fromEntries(SLICES.map((s) => [s.id, color])) as Answers;

describe("stages", () => {
  it("all green → Stage 2", () => {
    expect(computeStage(all(COLORS.green))).toBe(2);
  });

  it("a red safety slice → Stage 0", () => {
    const a = all(COLORS.green);
    a.keyCustody = COLORS.red;
    expect(computeStage(a)).toBe(0);
  });

  it("liveness slices only block Stage 2", () => {
    const a = all(COLORS.green);
    a.geoDiversity = COLORS.yellow;
    a.infraDiversity = COLORS.yellow;
    expect(computeStage(a)).toBe(1);
  });

  it("not sure counts as red", () => {
    const a = all(COLORS.green);
    a.osDiversity = COLORS.unknown;
    expect(computeStage(a)).toBe(0);
    a.osDiversity = COLORS.green;
    a.geoDiversity = COLORS.unknown;
    expect(computeStage(a)).toBe(1);
  });

  it("yellow safety slices are still Stage 1", () => {
    const a = all(COLORS.green);
    a.keyCustody = COLORS.yellow;
    a.clientDiversity = COLORS.yellow;
    expect(computeStage(a)).toBe(1);
  });

  it("incomplete → null stage", () => {
    expect(computeStage({ keyCustody: COLORS.green })).toBeNull();
  });

  it("STAGE_META names and tones line up with stage numbers", () => {
    ([0, 1, 2] as const).forEach((n) => {
      expect(STAGE_META[n].name).toBe(`Stage ${n}`);
      expect(STAGE_META[n].shareLine.length).toBeGreaterThan(0);
    });
    expect(STAGE_META[0].tone).toBe(COLORS.red);
    expect(STAGE_META[1].tone).toBe(COLORS.yellow);
    expect(STAGE_META[2].tone).toBe(COLORS.green);
  });
});

describe("blockers", () => {
  it("at Stage 0, lists only the safety slices holding you back", () => {
    const a = all(COLORS.green);
    a.cpuDiversity = COLORS.red;
    a.geoDiversity = COLORS.yellow;
    expect(blockers(a).map((s) => s.id)).toEqual(["cpuDiversity"]);
  });

  it("at Stage 1, lists every slice that isn't green", () => {
    const a = all(COLORS.green);
    a.keyCustody = COLORS.yellow;
    a.geoDiversity = COLORS.unknown;
    expect(blockers(a).map((s) => s.id)).toEqual(["keyCustody", "geoDiversity"]);
  });

  it("is empty at Stage 2", () => {
    expect(blockers(all(COLORS.green))).toEqual([]);
  });
});

describe("share codes", () => {
  it("encodes one letter per slice", () => {
    expect(shareCode(all(COLORS.green))).toBe("GGGGGG");
    const mixed: Answers = {
      keyCustody: COLORS.green,
      clientDiversity: COLORS.yellow,
      infraDiversity: COLORS.yellow,
      osDiversity: COLORS.unknown,
      cpuDiversity: COLORS.red,
      geoDiversity: COLORS.yellow,
    };
    expect(shareCode(mixed)).toBe("GYYURY");
    expect(decodeShareCode("GYYURY")).toEqual(mixed);
  });

  it("rejects bands a question can't produce", () => {
    expect(decodeShareCode("GGGYGG")).toBeNull(); // OS has no yellow band
    expect(decodeShareCode("GGRGGG")).toBeNull(); // Provider has no red band
    expect(decodeShareCode("GGGGG")).toBeNull();
    expect(decodeShareCode("GGGGGX")).toBeNull();
  });

  it("allShareCodes covers exactly the valid codes", () => {
    const codes = allShareCodes();
    const expected = SLICES.reduce((n, s) => n * sliceChoices(s).length, 1);
    expect(codes).toHaveLength(expected);
    expect(new Set(codes).size).toBe(expected);
    codes.forEach((c) => expect(decodeShareCode(c)).not.toBeNull());
  });
});

describe("questions stay in sync with the rubric", () => {
  it("each question offers exactly its slice's bands, best → worst", () => {
    SLICES.forEach((s) => {
      expect(QUESTIONS[s.id].options.map((o) => o.color)).toEqual([...s.bands]);
    });
  });

  it("every non-green answer has a tip", () => {
    SLICES.forEach((s) => {
      sliceChoices(s)
        .filter((c) => c !== COLORS.green)
        .forEach((c) => expect(getTip(s.id, c)).toBeTruthy());
    });
  });
});
