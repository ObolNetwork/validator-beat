/**
 * Writes the agent/LLM-facing static docs (built in lib/agents/files.ts from
 * the rubric, so they can never drift from the real questions and scoring):
 *
 *   public/llms.txt       — llmstxt.org site summary for LLM crawlers
 *   public/llms-full.txt  — the whole site's substance in one Markdown file
 *   public/skill.md       — a self-contained guide for an AI agent to run the
 *                           assessment conversationally and emit a share link
 *   public/sitemap.xml    — core pages + the agent docs
 *   public/robots.txt     — allow-all, pointing at the sitemap and agent docs
 *
 * Runs before `next build` (see package.json `build`).
 */
import fs from "fs";
import path from "path";
import { SITE_URL } from "../constants/index";
import { llmsFullTxt, llmsTxt, robotsTxt, sitemapXml, skillMd } from "../lib/agents/files";

const PUB = path.join(__dirname, "..", "public");

const FILES: Record<string, () => string> = {
  "llms.txt": llmsTxt,
  "llms-full.txt": llmsFullTxt,
  "skill.md": skillMd,
  "sitemap.xml": sitemapXml,
  "robots.txt": robotsTxt,
};

for (const [name, build] of Object.entries(FILES)) {
  fs.writeFileSync(path.join(PUB, name), build());
}
console.log(`Generated public/{${Object.keys(FILES).join(",")}} (base: ${SITE_URL})`);
