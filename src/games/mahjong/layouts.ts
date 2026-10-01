import type { Difficulty } from '../../settings/settings';
import type { Pos } from './rules';

// Positions are in half-tile units (a tile covers 2x2): x and y step by 2 for a neighbour,
// by 1 for a half-tile offset. Upper layers sit on the tiles below.
function grid(z: number, x0: number, y0: number, cols: number, rows: number): Pos[] {
  const tiles: Pos[] = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) tiles.push({ x: x0 + c * 2, y: y0 + r * 2, z });
  return tiles;
}

export interface LevelDef {
  id: Difficulty;
  number: number; // shown as "Level 2"
  positions: Pos[];
  copies: number; // how many times each picture appears (2 = every picture has exactly one partner)
}

export const LEVELS: Record<Difficulty, LevelDef> = {
  // 24 tiles: small, two layers (18 on the table, 6 on top).
  easy: {
    id: 'easy',
    number: 1,
    copies: 2,
    positions: [...grid(0, 0, 0, 6, 3), ...grid(1, 3, 1, 3, 2)],
  },
  // 40 tiles: a three-layer stepped block.
  medium: {
    id: 'medium',
    number: 2,
    copies: 2,
    positions: [...grid(0, 0, 0, 8, 3), ...grid(1, 2, 1, 6, 2), ...grid(2, 5, 1, 2, 2)],
  },
  // 64 tiles: a four-layer pyramid.
  hard: {
    id: 'hard',
    number: 3,
    copies: 2,
    positions: [...grid(0, 0, 0, 8, 4), ...grid(1, 2, 1, 6, 3), ...grid(2, 4, 2, 4, 2), ...grid(3, 5, 2, 3, 2)],
  },
  // 80 tiles: a tall five-layer pyramid.
  veryHard: {
    id: 'veryHard',
    number: 4,
    copies: 2,
    positions: [
      ...grid(0, 0, 0, 10, 4),
      ...grid(1, 2, 1, 8, 3),
      ...grid(2, 6, 2, 4, 2),
      ...grid(3, 7, 2, 3, 2),
      ...grid(4, 8, 3, 2, 1),
    ],
  },
};
