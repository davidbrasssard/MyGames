// Generates the PWA icons (pure Node, no dependencies): node scripts/generate-icons.mjs
import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
};
const encodePng = (size, rgb) => {
  const raw = Buffer.alloc(size * (size * 3 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 3 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      const [r, g, b] = rgb(x / size, y / size, size);
      const o = y * (size * 3 + 1) + 1 + x * 3;
      raw[o] = r; raw[o + 1] = g; raw[o + 2] = b;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
};

const lerp = (a, b, t) => a + (b - a) * t;
const mix = (c1, c2, t) => c1.map((v, i) => lerp(v, c2[i], t));
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const SKY = [191, 228, 247];
const LAKE = [47, 134, 168];
const LEAF = [255, 255, 255];
const RIB = [42, 127, 143];

// A white leaf (two-circle lens) with a teal midrib on a sky-to-lake gradient.
const icon = (leafScale) => (x, y, size) => {
  let col = mix(SKY, LAKE, clamp01(y * 1.1));
  const h = leafScale * 0.5;
  const w = h * 0.55;
  const R = (w + (h * h) / w) / 2;
  const c = ((h * h) / w - w) / 2;
  const u = (x - 0.5 - (y - 0.5)) / Math.SQRT2;
  const v = (x - 0.5 + (y - 0.5)) / Math.SQRT2;
  const dA = R - Math.hypot(u, v - c);
  const dB = R - Math.hypot(u, v + c);
  const leafA = clamp01(Math.min(dA, dB) * size + 0.5);
  col = mix(col, LEAF, leafA);
  if (Math.abs(u) < h * 0.85) col = mix(col, RIB, clamp01((0.008 - Math.abs(v)) * size + 0.5) * leafA);
  return col.map((n) => Math.round(n));
};

const out = (name, size, scale) => writeFileSync(`public/icons/${name}`, encodePng(size, icon(scale)));
out('icon-192.png', 192, 0.62);
out('icon-512.png', 512, 0.62);
out('maskable-512.png', 512, 0.46);
out('apple-touch-icon-180.png', 180, 0.62);
console.log('icons written to public/icons');
