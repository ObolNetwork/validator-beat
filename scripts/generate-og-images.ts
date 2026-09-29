import fs from "fs";
import path from "path";
import sharp from "sharp";
import { allShareCodes, decodeShareCode } from "../lib/rubric/index";
import { landingOgSvg } from "../lib/share/landing-og-svg";
import { badgeSvg } from "../lib/share/badge-svg";
import { pizzaOgSvg } from "../lib/share/pizza-og-svg";

const OUT_DIR = path.join(__dirname, "..", "public", "og");
const BADGE_DIR = path.join(__dirname, "..", "public", "badge");

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://validatorbeat.com";
const DISPLAY_HOST = SITE_URL.replace(/^https?:\/\//, "").replace(/\/+$/, "");

async function main() {
  // Start clean so codes dropped from the rubric don't linger as stale files.
  for (const [dir, ext] of [[OUT_DIR, ".png"], [BADGE_DIR, ".svg"]] as const) {
    fs.mkdirSync(dir, { recursive: true });
    fs.readdirSync(dir)
      .filter((f) => f.endsWith(ext))
      .forEach((f) => fs.rmSync(path.join(dir, f)));
  }
  const codes = allShareCodes();
  let done = 0;

  console.log(`OG images: using display host "${DISPLAY_HOST}"`);

  for (const code of codes) {
    const answers = decodeShareCode(code);
    if (!answers) continue;
    const svg = pizzaOgSvg(answers, code, DISPLAY_HOST);
    const out = path.join(OUT_DIR, `${code}.png`);
    await sharp(Buffer.from(svg)).png().toFile(out);
    fs.writeFileSync(path.join(BADGE_DIR, `${code}.svg`), badgeSvg(answers));
    done++;
    if (done % 256 === 0) {
      console.log(`OG images: ${done}/${codes.length}`);
    }
  }

  // Default landing-page card (shared when the root domain is posted).
  await sharp(Buffer.from(landingOgSvg(DISPLAY_HOST)))
    .png()
    .toFile(path.join(OUT_DIR, "landing.png"));

  console.log(`Generated ${done} share images + landing.png in public/og/, ${done} badges in public/badge/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
