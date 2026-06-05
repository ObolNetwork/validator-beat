import fs from "fs";
import path from "path";
import sharp from "sharp";

const PUBLIC_DIR = path.join(__dirname, "..", "public");
const SOURCE_SVG = path.join(PUBLIC_DIR, "icon.svg");

const SIZES: Array<{ name: string; size: number }> = [
  { name: "favicon-16.png", size: 16 },
  { name: "favicon-32.png", size: 32 },
  { name: "apple-touch-icon.png", size: 180 },
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
];

async function main() {
  const svg = fs.readFileSync(SOURCE_SVG);
  for (const { name, size } of SIZES) {
    const out = path.join(PUBLIC_DIR, name);
    await sharp(svg).resize(size, size).png().toFile(out);
    console.log(`Wrote ${name} (${size}x${size})`);
  }
  console.log(`Generated ${SIZES.length} icons from icon.svg`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
