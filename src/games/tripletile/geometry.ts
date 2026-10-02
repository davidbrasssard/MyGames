import { TILE_UNITS, TRAY_SIZE, type Pos } from './rules';

// Turns layout positions into pixels. The board (quarter-tile units) and the 7-slot tray below it are fitted together
// into the space available, so tiles come out as large as possible. Every size is a multiple of the pitch
// (the width of one grid step), so it is computed once for pitch 1 and scaled.
// Like Mahjong, face + side thickness fill the grid step exactly, so neighbours touch with no gap.
export const THICK_L = 0.06; // blue thickness on the left, in pitches
export const FACE_W = 1 - THICK_L; // tile face width: face + left thickness = one pitch
export const FACE_H = FACE_W * 1.12; // tile face height
export const THICK = 0.115; // thicker blue thickness under the face (bottom)
export const ROW = FACE_H + THICK; // vertical step between two rows: face + bottom thickness, no gap
// Each layer sits up by the bottom thickness and right by the left thickness (as Mahjong does with its one thickness),
// so a higher tile covers the lower one's face and only the thickness edges of the pile show.
export const LIFT = THICK;
export const LEAN = THICK_L;
const SHADOW = 0.06; // room for the ground shadow, left of and below the board
const TRAY_PAD = 0.28; // space round the slots inside the tray
const TRAY_GAP = 0.4; // space between the board and the tray
const MAX_PITCH = 150;

export interface Geometry {
  tw: number; // tile face width in px
  th: number;
  t: number; // bottom thickness in px
  tl: number; // left thickness in px
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
    const l = p.x / TILE_UNITS + p.z * LEAN;
    const t = (p.y / TILE_UNITS) * ROW - p.z * LIFT;
    l1.push(l);
    t1.push(t);
    minX = Math.min(minX, l - THICK_L - SHADOW);
    maxX = Math.max(maxX, l + FACE_W);
    minT = Math.min(minT, t);
    maxB = Math.max(maxB, t + FACE_H + THICK + SHADOW);
  }
  const boardW = maxX - minX;
  const boardH = maxB - minT;
  const trayW = (TRAY_SIZE - 1) + FACE_W + THICK_L + 2 * TRAY_PAD;
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
    tl: THICK_L * pitch,
    left: l1.map((l) => boardX + (l - minX) * pitch),
    top: t1.map((t) => offsetY + (t - minT) * pitch),
    slotLeft: Array.from({ length: TRAY_SIZE }, (_, k) => trayLeft + (TRAY_PAD + THICK_L + k) * pitch),
    slotTop: trayTop + TRAY_PAD * pitch,
    trayLeft,
    trayTop,
    trayWidth: trayW * pitch,
    trayHeight: trayH * pitch,
  };
}
