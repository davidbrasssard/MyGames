import type { CSSProperties } from 'react';
import { Tile } from '../kit/Tile';
import { TILES_FLUENT } from '../pictures/tilesFluent';
import { TRIPLE_TILES_FLUENT } from '../pictures/tripleTilesFluent';
import { pictureUrl } from '../pictures';
import { computeGeometry as mahjongGeometry } from './mahjong/geometry';
import { FACE_H, FACE_W, THICK, THICK_L } from './tripletile/geometry';
import { tileVars } from './tripletile/tileLook';

// Home icons for Mahjong and Trio are static mini scenes drawn with the games' real tile styles (the kit Tile and the
// kit tile depth + .tt-tile CSS). Geometry is computed on a 68 x 68 design box (1 unit = 0.1rem) and every length is
// calc(var(--k) * Nrem), where --k (set in styles.css on .game-icon) grows the scene with the larger icon box.
const BOX = 68;
const len = (v: number) => `calc(var(--k) * ${(v / 10).toFixed(3)}rem)`;
const picture = (collection: { pictures: { id: string; name: { fr: string; en: string } }[] }, id: string) =>
  collection.pictures.find((p) => p.id === id)!;

// 2 tiles at the bottom, 2 on top (half a tile up and to the right), leaning right like the game.
const MAHJONG_PILE = [
  { x: 0, y: 1, z: 0, pic: 'sunflower' },
  { x: 2, y: 1, z: 0, pic: 'tulip' },
  { x: 1, y: 0, z: 1, pic: 'swan' },
  { x: 3, y: 0, z: 1, pic: 'tree' },
];

export function MahjongIcon() {
  const g = mahjongGeometry(MAHJONG_PILE, BOX, BOX);
  return (
    <div className="icon-scene" aria-hidden="true" style={{ '--tw': len(g.tw), '--t': len(g.t) } as CSSProperties}>
      {MAHJONG_PILE.map((p, i) => (
        <Tile
          key={p.pic}
          picture={picture(TILES_FLUENT, p.pic)}
          shade={1 - p.z}
          style={{ left: len(g.left[i]), top: len(g.top[i]), width: len(g.tw), height: len(g.th), zIndex: p.z * 10 + i }}
        />
      ))}
    </div>
  );
}

// Three strawberry tiles of a completed set, each one a little higher and further right than the last.
export function TripleTileIcon() {
  const step = 0.8; // horizontal step in pitches (tiles overlap a little)
  const rise = 0.1; // vertical step in pitches
  const w = 2 * step + FACE_W + THICK_L;
  const h = FACE_H + THICK + 2 * rise;
  const pitch = Math.min(BOX / w, BOX / h);
  const x0 = (BOX - w * pitch) / 2 + THICK_L * pitch;
  const y0 = (BOX - h * pitch) / 2;
  const berry = picture(TRIPLE_TILES_FLUENT, 'strawberry');
  const vars = { '--tw': len(FACE_W * pitch), '--t': len(THICK * pitch), '--tl': len(THICK_L * pitch) } as CSSProperties;
  return (
    <div className="icon-scene" aria-hidden="true" style={vars}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="tt-pos"
          style={{
            ...tileVars(0),
            left: len(x0 + i * step * pitch),
            top: len(y0 + (2 - i) * rise * pitch),
            width: len(FACE_W * pitch),
            height: len(FACE_H * pitch),
            zIndex: i,
          }}
        >
          <div className="td-drop" />
          <div className="tt-tile td-solid">
            <img src={pictureUrl(TRIPLE_TILES_FLUENT, berry)} alt="" draggable={false} />
          </div>
        </div>
      ))}
    </div>
  );
}

// Simple illustrated game icons (placeholders until the real picture system lands).
export function MatchIcon() {
  return (
    <svg viewBox="0 0 96 96" aria-hidden="true">
      <g transform="rotate(-10 34 52)">
        <rect x="10" y="22" width="46" height="56" rx="9" fill="#fff" stroke="#c9d9e6" strokeWidth="2" />
        <circle cx="33" cy="50" r="12" fill="#f4b73a" />
        <circle cx="33" cy="50" r="5" fill="#a5651d" />
      </g>
      <g transform="rotate(9 64 48)">
        <rect x="42" y="16" width="46" height="56" rx="9" fill="#fff" stroke="#c9d9e6" strokeWidth="2" />
        <circle cx="65" cy="44" r="12" fill="#e66a9a" />
        <circle cx="65" cy="44" r="5" fill="#f9d5e2" />
      </g>
    </svg>
  );
}

export function Match3Icon() {
  return (
    <svg viewBox="0 0 96 96" aria-hidden="true">
      <circle cx="30" cy="34" r="17" fill="#e8483f" />
      <circle cx="30" cy="34" r="6" fill="#f6a39c" />
      <circle cx="66" cy="34" r="17" fill="#f4b73a" />
      <circle cx="66" cy="34" r="6" fill="#fbe2a3" />
      <path d="M48 52c-13 14-19 22-19 29a19 19 0 0 0 38 0c0-7-6-15-19-29z" fill="#3f8fe0" />
      <ellipse cx="42" cy="72" rx="4" ry="6" fill="#a9d1f7" />
    </svg>
  );
}

export function PuzzlesIcon() {
  return (
    <svg viewBox="0 0 96 96" aria-hidden="true">
      <rect x="10" y="10" width="36" height="36" rx="7" fill="#6fb6e8" />
      <rect x="50" y="10" width="36" height="36" rx="7" fill="#8fcf8a" />
      <rect x="10" y="50" width="36" height="36" rx="7" fill="#f4b73a" />
      <rect x="50" y="50" width="36" height="36" rx="7" fill="#fff" stroke="#c9d9e6" strokeWidth="3" strokeDasharray="6 6" />
    </svg>
  );
}

export function LeafIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M10 54C8 28 26 10 56 8c2 30-16 48-46 46z" fill="#3f9d5a" />
      <path d="M14 50L46 18" stroke="#d9f0df" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
