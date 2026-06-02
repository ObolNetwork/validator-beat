import { RUBRIC_VERSION } from "./index";

describe("rubric", () => {
  it("targets the v1.2 framework", () => {
    expect(RUBRIC_VERSION).toBe("1.2");
  });
});
