import type { Pos } from './rules';

// Turns layout positions into pixels, fitted to the space available.
// One tile "pitch" (the grid step) holds the tile face + its visible side thickness (on the LEFT and
// BOTTOM), so neighbours sit tight like a real set. Each layer shifts up and RIGHT by the thickness,
// so the stack leans right.
export const TILE_ASPECT = 1.25; // grid step height / grid step width
export const THICKNESS = 0.11; // visible side thickness, in pitches
const MAX_PITCH = 160;
const TOP_ROOM = 0.12; // room above the board for a lifted tile

export interface Geometry {
  tw: number; // tile face width in px
  th: number; // tile face height in px
  t: number; // thickness in px
  left: number[]; // face position of each tile, relative to the board area
  top: number[];
}

export function computeGeometry(positions: readonly Pos[], width: number, height: number): Geometry {
  const faceW = 1 - THICKNESS;
  const faceH = TILE_ASPECT - THICKNESS;
  let minL = Infinity;
  let maxR = -Infinity;
  let minT = Infinity;
  let maxB = -Infinity;
  const l1: number[] = [];
  const t1: number[] = [];
  for (const p of positions) {
    const l = p.x / 2 + THICKNESS + p.z * THICKNESS; // face left (the side face sits to its left)
    const t = (p.y / 2) * TILE_ASPECT - p.z * THICKNESS;
    l1.push(l);
    t1.push(t);
    minL = Math.min(minL, l - THICKNESS);
    maxR = Math.max(maxR, l + faceW);
    minT = Math.min(minT, t);
    maxB = Math.max(maxB, t + faceH + THICKNESS);
  }
  const w1 = maxR - minL;
  const h1 = maxB - minT + TOP_ROOM;
  const pitch = Math.max(1, Math.min(width / w1, height / h1, MAX_PITCH));
  const offsetX = (width - w1 * pitch) / 2;
  const offsetY = (height - h1 * pitch) / 2 + TOP_ROOM * pitch;
  return {
    tw: faceW * pitch,
    th: faceH * pitch,
    t: THICKNESS * pitch,
    left: l1.map((l) => offsetX + (l - minL) * pitch),
    top: t1.map((t) => offsetY + (t - minT) * pitch),
  };
}
