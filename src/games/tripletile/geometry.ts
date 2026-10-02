import { TILE_UNITS, TRAY_SIZE, type Pos } from './rules';

// Turns layout positions into pixels. The board (quarter-tile units) and the 7-slot tray below it are fitted together
// into the space available, so tiles come out as large as possible. Every size is a multiple of the pitch
// (the width of one grid step), so it is computed once for pitch 1 and scaled.
export const FACE_W = 0.94; // tile face width, in pitches
export const FACE_H = FACE_W * 1.12; // tile face height
export const THICK = FACE_W * 0.09; // soft blue thickness under the face
export const ROW = FACE_H + THICK + 0.03; // vertical step between two rows of tiles
// Each layer sits this much higher, so the edges of a deep pile stay visible.
export const LIFT = THICK * 1.3;
const TRAY_PAD = 0.28; // space round the slots inside the tray
const TRAY_GAP = 0.4; // space between the board and the tray
const MAX_PITCH = 150;

export interface Geometry {
  tw: number; // tile face width in px
  th: number;
  t: number; // thickness in px
  left: number[]; // board tile top-left, relative to the field
  top: number[];
  slotLeft: number[]; // tray slot top-left
  slotTop: number;
  trayLeft: number; // tray panel
  trayTop: number;
  trayWidth: number;
  trayHeight: number;
}

export function computeGeometry(positions: readonly Pos[], width: number, height: number): Geometry {
  let minX = Infinity;
  let maxX = -Infinity;
  let minT = Infinity;
  let maxB = -Infinity;
  const l1: number[] = [];
  const t1: number[] = [];
  for (const p of positions) {
    const l = p.x / TILE_UNITS;
    const t = (p.y / TILE_UNITS) * ROW - p.z * LIFT;
    l1.push(l);
    t1.push(t);
    minX = Math.min(minX, l);
    maxX = Math.max(maxX, l + FACE_W);
    minT = Math.min(minT, t);
    maxB = Math.max(maxB, t + FACE_H + THICK);
  }
  const boardW = maxX - minX;
  const boardH = maxB - minT;
  const trayW = (TRAY_SIZE - 1) + FACE_W + 2 * TRAY_PAD;
  const trayH = FACE_H + THICK + 2 * TRAY_PAD;
  const totalW = Math.max(boardW, trayW);
  const totalH = boardH + TRAY_GAP + trayH;

  const pitch = Math.max(1, Math.min(width / totalW, height / totalH, MAX_PITCH));
  const offsetY = (height - totalH * pitch) / 2;
  const boardX = (width - boardW * pitch) / 2;
  const trayTop = offsetY + (boardH + TRAY_GAP) * pitch;
  const trayLeft = (width - trayW * pitch) / 2;

  return {
    tw: FACE_W * pitch,
    th: FACE_H * pitch,
    t: THICK * pitch,
    left: l1.map((l) => boardX + (l - minX) * pitch),
    top: t1.map((t) => offsetY + (t - minT) * pitch),
    slotLeft: Array.from({ length: TRAY_SIZE }, (_, k) => trayLeft + (TRAY_PAD + k) * pitch),
    slotTop: trayTop + TRAY_PAD * pitch,
    trayLeft,
    trayTop,
    trayWidth: trayW * pitch,
    trayHeight: trayH * pitch,
  };
}
