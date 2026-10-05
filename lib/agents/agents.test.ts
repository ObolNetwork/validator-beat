import { QUESTIONS } from "@lib/assessment/questions";
import { NUANCE_CASES, UNSCORED } from "@lib/methodology/content";
import { SLICES, STAGE_META, TIPS, allShareCodes } from "@lib/rubric";
import { llmsFullTxt, llmsTxt, sitemapXml, skillMd } from "./files";
import { AGENT_FILES, assessPrompt, resultPrompt } from "./prompts";

describe("llms-full.txt", () => {
  const doc = llmsFullTxt();

  it("contains every slice, question, band, and tip from the rubric", () => {
    for (const s of SLICES) {
      const q = QUESTIONS[s.id];
      expect(doc).toContain(s.label);
      expect(doc).toContain(s.why);
      expect(doc).toContain(q.q);
      expect(doc).toContain(q.helper);
      for (const o of q.options) {
        expect(doc).toContain(o.label);
        expect(doc).toContain(o.sub);
      }
      for (const tip of Object.values(TIPS[s.id])) expect(doc).toContain(tip);
    }
  });

  it("lists slices in share-code order", () => {
    const positions = SLICES.map((s) => doc.indexOf(`(\`${s.id}\`, share-code position`));
    expect(positions.every((p) => p >= 0)).toBe(true);
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
  });

  it("contains every stage and the methodology nuances", () => {
    for (const m of Object.values(STAGE_META)) expect(doc).toContain(m.tagline);
    for (const n of NUANCE_CASES) expect(doc).toContain(n.body);
    for (const u of UNSCORED) expect(doc).toContain(u.body);
    expect(doc).toContain(`${allShareCodes().length} valid codes`);
  });
});

describe("agent file links", () => {
  it("llms.txt, skill.md and the sitemap point at llms-full.txt", () => {
    expect(llmsTxt()).toContain("/llms-full.txt");
    expect(skillMd()).toContain("/llms-full.txt");
    for (const f of AGENT_FILES) expect(sitemapXml()).toContain(`${f.path}</loc>`);
  });
});

describe("prompts", () => {
  it("embeds the share code and its stage", () => {
    const p = resultPrompt("GYYGGY");
    expect(p).toContain("/GYYGGY/");
    expect(p).toContain("which is Stage 1");
    expect(p).toContain("reach Stage 2");
  });

  it("points the assess prompt at skill.md", () => {
    expect(assessPrompt()).toContain("/skill.md");
  });
});
