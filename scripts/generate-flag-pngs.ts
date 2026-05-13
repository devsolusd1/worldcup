import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { COUNTRIES, type CountryToken } from "../lib/countries";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "flags-png");
const FLAGS_DIR = path.join(
  ROOT,
  "node_modules",
  "flag-icons",
  "flags",
  "4x3",
);

// 1024x1024 PNG, white background, flag (4:3) centered at 800x600 = 100px top/bottom letterbox
const CANVAS = 1024;
const FLAG_W = 800;
const FLAG_H = 600;
const OFFSET_X = Math.floor((CANVAS - FLAG_W) / 2);
const OFFSET_Y = Math.floor((CANVAS - FLAG_H) / 2);

async function generate(country: CountryToken): Promise<string> {
  const svgPath = path.join(FLAGS_DIR, `${country.iso2}.svg`);
  const svg = await readFile(svgPath);

  const flagBuf = await sharp(svg, { density: 300 })
    .resize(FLAG_W, FLAG_H, { fit: "fill" })
    .png()
    .toBuffer();

  const outPath = path.join(OUT_DIR, `${country.code}.png`);
  await sharp({
    create: {
      width: CANVAS,
      height: CANVAS,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([{ input: flagBuf, top: OFFSET_Y, left: OFFSET_X }])
    .png()
    .toFile(outPath);

  return country.code;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  console.log(`Generating ${COUNTRIES.length} flag PNGs → ${OUT_DIR}`);
  console.log(`Canvas ${CANVAS}x${CANVAS}, flag ${FLAG_W}x${FLAG_H}, bg white`);
  console.log("");

  const codes = await Promise.all(COUNTRIES.map(generate));

  console.log(`✓ Done — ${codes.length} files`);
  console.log(codes.sort().join("  "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
