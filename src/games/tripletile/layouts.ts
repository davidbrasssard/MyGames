import type { Difficulty } from '../../settings/settings';
import type { Pos } from './rules';

// Positions are in half-tile units (a tile covers 2x2), as in Mahjong. Every layer is centred on the
// same point, so layouts are symmetric; a layer with a different column/row parity from the one
// below it sits a half tile off, like the real game. A tile is blocked by any higher-layer tile
// that overlaps it (see rules.ts).

function centred(z: number, cols: number, rows: number, cx: number, cy: number): Pos[] {
  const tiles: Pos[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) tiles.push({ x: cx - cols + c * 2, y: cy - rows + r * 2, z });
  }
  return tiles;
}

export interface LevelDef {
  id: Difficulty;
  number: number; // shown as "Level 2"
  positions: Pos[];
  pictureCount: number; // pictures used on each board (each appears in exactly 2 sets of 3)
  canLose: boolean; // Défi levels: a full tray ends the game; Détente levels: undo
}

export const LEVELS: Record<Difficulty, LevelDef> = {
  // 36 tiles, 2 layers: 6x5 + 3x2.
  easy: {
    id: 'easy',
    number: 1,
    pictureCount: 6,
    canLose: false,
    positions: [...centred(0, 6, 5, 6, 5), ...centred(1, 3, 2, 6, 5)],
  },
  // 54 tiles, 3 layers: 6x5 + 5x4 + 2x2.
  medium: {
    id: 'medium',
    number: 2,
    pictureCount: 9,
    canLose: false,
    positions: [...centred(0, 6, 5, 6, 5), ...centred(1, 5, 4, 6, 5), ...centred(2, 2, 2, 6, 5)],
  },
  // 72 tiles, 3 layers: 8x5 + 7x4 + 2x2.
  hard: {
    id: 'hard',
    number: 3,
    pictureCount: 12,
    canLose: true,
    positions: [...centred(0, 8, 5, 8, 5), ...centred(1, 7, 4, 8, 5), ...centred(2, 2, 2, 8, 5)],
  },
  // 90 tiles, 4 layers: 9x5 + 8x4 + 3x3 + 2x2.
  veryHard: {
    id: 'veryHard',
    number: 4,
    pictureCount: 15,
    canLose: true,
    positions: [
      ...centred(0, 9, 5, 9, 5),
      ...centred(1, 8, 4, 9, 5),
      ...centred(2, 3, 3, 9, 5),
      ...centred(3, 2, 2, 9, 5),
    ],
  },
};
