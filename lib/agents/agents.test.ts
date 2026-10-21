import { QUESTIONS } from "@lib/assessment/questions";
import { NUANCE_CASES, UNSCORED } from "@lib/methodology/content";
import { SLICES, STAGE_META, TIPS, allShareCodes } from "@lib/rubric";
import { costLink, llmsFullTxt, llmsTxt, sitemapXml, skillMd } from "./files";
import { AGENT_FILES, assessPrompt, costPrompt, resultPrompt } from "./prompts";
import { FORMULAS } from "@lib/cost/methodology";
import { DEFAULT_PARAMS, URL_KEYS, decodeParams } from "@lib/cost/params";
import { REFS } from "@lib/cost/references";
import { costSummary } from "@lib/cost/summary";
import { fmtEth } from "@lib/cost/format";

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

describe("cost of failure in the agent docs", () => {
  const doc = llmsFullTxt();
  const c = costSummary();

  it("llms-full.txt has the section, every formula, every reference and every URL key", () => {
    expect(doc).toContain("## Cost of failure");
    for (const f of FORMULAS) expect(doc).toContain(f.body);
    for (const r of REFS) expect(doc).toContain(r.url);
    for (const k of Object.values(URL_KEYS)) expect(doc).toContain(`| \`${k}\` |`);
  });

  it("quotes the same headline numbers the page computes", () => {
    expect(doc).toContain(fmtEth(c.lossPerYearSoloEth));
    expect(doc).toContain(fmtEth(c.premiumPerYearEth));
    expect(doc).toContain(`${c.breakEvenRatePct}%`);
    expect(llmsTxt()).toContain(fmtEth(c.netPerYearEth));
  });

  it("example links decode to the parameters they describe", () => {
    const url = costLink({ stakeEth: 500_000, operators: 8, operatorSharePct: 5 });
    const p = decodeParams(new URL(url).search);
    expect(p).toEqual({ ...DEFAULT_PARAMS, stakeEth: 500_000, operators: 8, operatorSharePct: 5 });
    expect(costLink()).toMatch(/\/cost-of-failure\/$/);
  });

  it("is linked from llms.txt, skill.md, the sitemap and the prompt", () => {
    expect(llmsTxt()).toContain("/cost-of-failure/");
    expect(skillMd()).toContain("/cost-of-failure/");
    expect(sitemapXml()).toContain("/cost-of-failure/</loc>");
    expect(costPrompt()).toContain("/llms-full.txt");
  });
});
