import fs from "fs";
import path from "path";
import sharp from "sharp";
import { decodeShareCode } from "../lib/rubric/index";
import { pizzaOgSvg } from "../lib/share/pizza-og-svg";
import { allShareCodes } from "../lib/theme/share-codes";

const OUT_DIR = path.join(__dirname, "..", "public", "og");

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const codes = allShareCodes();
  let done = 0;

  for (const code of codes) {
    const answers = decodeShareCode(code);
    if (!answers) continue;
    const svg = pizzaOgSvg(answers, code);
    const out = path.join(OUT_DIR, `${code}.png`);
    await sharp(Buffer.from(svg)).png().toFile(out);
    done++;
    if (done % 81 === 0) {
      console.log(`OG images: ${done}/${codes.length}`);
    }
  }

  console.log(`Generated ${done} OG images in public/og/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
