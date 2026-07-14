import fs from "fs";
import path from "path";
import sharp from "sharp";
import { decodeShareCode } from "../lib/rubric/index";
import { landingOgSvg } from "../lib/share/landing-og-svg";
import { pizzaOgSvg } from "../lib/share/pizza-og-svg";
import { allShareCodes } from "../lib/theme/share-codes";

const OUT_DIR = path.join(__dirname, "..", "public", "og");

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://validatorbeat.com";
const DISPLAY_HOST = SITE_URL.replace(/^https?:\/\//, "").replace(/\/+$/, "");

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const codes = allShareCodes();
  let done = 0;

  console.log(`OG images: using display host "${DISPLAY_HOST}"`);

  for (const code of codes) {
    const answers = decodeShareCode(code);
    if (!answers) continue;
    const svg = pizzaOgSvg(answers, code, DISPLAY_HOST);
    const out = path.join(OUT_DIR, `${code}.png`);
    await sharp(Buffer.from(svg)).png().toFile(out);
    done++;
    if (done % 81 === 0) {
      console.log(`OG images: ${done}/${codes.length}`);
    }
  }

  // Default landing-page card (shared when the root domain is posted).
  await sharp(Buffer.from(landingOgSvg(DISPLAY_HOST)))
    .png()
    .toFile(path.join(OUT_DIR, "landing.png"));

  console.log(`Generated ${done} share images + landing.png in public/og/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
