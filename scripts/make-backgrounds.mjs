// One-off: turns the original photos in bg-src/ (never committed) into the Triple Tile backgrounds:
// 1600x1000 JPEG, cropped to fill around the centre, left sharp and at normal contrast,
// quality lowered step by step until each file is about 150 KB. Writes public/backgrounds/<name>.jpg.
// Photo -> name: a file named exactly like the target (lake.jpg, balloons.png...) is used for it;
// otherwise the photos are taken in alphabetical order. Run with:  node scripts/make-backgrounds.mjs
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const NAMES = ['lake', 'balloons', 'river-sunset', 'cloud-lake', 'sky-sunset', 'green-hills'];
const W = 1600;
const H = 1000;
const TARGET = 150 * 1024;

const src = new URL('../bg-src/', import.meta.url);
if (!existsSync(src)) throw new Error('bg-src/ not found: put the 6 original photos there first.');
const files = readdirSync(src).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort();
if (files.length < NAMES.length) console.warn(`only ${files.length} photos for ${NAMES.length} backgrounds`);

const free = [...files];
const picked = NAMES.map((name) => {
  const i = free.findIndex((f) => f.toLowerCase().replace(/\.[a-z]+$/, '') === name);
  return i >= 0 ? free.splice(i, 1)[0] : null;
});
picked.forEach((f, i) => {
  if (!f) picked[i] = free.shift() ?? null;
});

const out = new URL('../public/backgrounds/', import.meta.url);
mkdirSync(out, { recursive: true });
let total = 0;
for (let i = 0; i < NAMES.length; i++) {
  if (!picked[i]) continue;
  const base = await sharp(fileURLToPath(new URL(picked[i], src)))
    .rotate()
    .resize(W, H, { fit: 'cover', position: 'centre' })
    .toBuffer();
  let buf;
  for (let q = 80; q >= 45; q -= 5) {
    buf = await sharp(base).jpeg({ quality: q, mozjpeg: true }).toBuffer();
    if (buf.length <= TARGET) break;
  }
  writeFileSync(new URL(`${NAMES[i]}.jpg`, out), buf);
  total += buf.length;
  console.log(`${NAMES[i].padEnd(14)} <- ${picked[i].padEnd(30)} ${Math.round(buf.length / 1024)} KB`);
}
console.log(`total ${Math.round(total / 1024)} KB`);
