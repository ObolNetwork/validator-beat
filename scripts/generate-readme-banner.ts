/**
 * Renders the README header image (docs/images/banner.png) from the landing
 * OG card, at 2x for crisp display on GitHub. Committed to the repo; rerun
 * `yarn build:banner` when the landing card changes.
 */
import path from "path";
import sharp from "sharp";
import { landingOgSvg } from "../lib/share/landing-og-svg";

const OUT = path.join(__dirname, "..", "docs", "images", "banner.png");

sharp(Buffer.from(landingOgSvg("validatorbeat.com")), { density: 144 })
  .png({ compressionLevel: 9 })
  .toFile(OUT)
  .then(() => console.log(`Wrote ${path.relative(process.cwd(), OUT)}`))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
