import type { Difficulty } from '../../settings/settings';
import type { Pos, Rng } from './rules';

// Positions are in quarter-tile units (a tile covers 4x4 units), so tiles can sit a small diagonal offset
// from the ones below them. x goes right, y goes down, z is the layer (higher z is drawn on top, and slightly
// higher up the screen). A tile is blocked by any higher-layer tile that overlaps it at all (see rules.ts).
//
// Each shape is drawn as ASCII art on a one-tile grid: '1' is a spot with a pile, 'f' is a spot with a
// "step cluster" (a small group of 3 tiles: the spot itself, then 2 more, each half a tile further toward the
// centre of the shape and one layer higher). Clusters sit inside the outline, never sticking out of it.
// The builder then raises the piles, centre first, until the level's exact tile count is reached. It
// keeps the left-right mirror (and the top-bottom mirror when the art has it) so every layout is symmetric.

export interface LayoutDef {
  id: string;
  name: { fr: string; en: string };
  positions: Pos[];
}

export interface LevelDef {
  id: Difficulty;
  number: number; // shown as "Level 2"
  tiles: number; // exact tile count of every layout of this level
  maxPile: number; // most tiles on the same spot
  maxLayers: number; // most layers (a fan counts its height too)
  layouts: LayoutDef[]; // 4 per level
  pictureCount: number; // pictures used on each board (each appears in exactly 2 sets of 3)
  canLose: boolean; // Défi levels: a full tray ends the game; Détente levels: undo
}

interface Shape {
  id: string;
  fr: string;
  en: string;
  art: string[];
  fanN?: number; // steps in each cluster ('f' spots)
}

const FAN_STEP = 2; // a step is half a tile (2 quarter units), so every step shows its face edge
const MAX_FAN = 2; // 2 steps on top of the spot = a group of 3 tiles

function build(shape: Shape, tiles: number, maxPile: number): LayoutDef {
  const { art } = shape;
  const rows = art.length;
  const cols = Math.max(...art.map((r) => r.length));
  const fanN = Math.min(shape.fanN ?? 0, MAX_FAN);
  const cx = (cols - 1) / 2;
  const cy = (rows - 1) / 2;
  const cells: { x: number; y: number; fan: boolean }[] = [];
  art.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      if (ch === '1' || ch === 'f') cells.push({ x, y, fan: ch === 'f' });
    }),
  );
  const has = new Set(cells.map((c) => `${c.x},${c.y}`));
  const upDown = cells.every((c) => has.has(`${c.x},${rows - 1 - c.y}`));

  // Piles are raised together with their mirror images, so the layout stays symmetric. When the exact count
  // cannot be reached that way, taller or flatter towers, then only the left-right mirror, are tried.
  // A step on layer k must never overlap another tile on layer k, so piles under or next to a cluster
  // are capped at k tiles.
  const cap = new Map<string, number>();
  for (const c of cells.filter((f) => f.fan)) {
    const sx = -Math.sign(c.x - cx);
    const sy = -Math.sign(c.y - cy);
    for (let k = 1; k <= fanN; k++) {
      const tx = c.x + (sx * k * FAN_STEP) / 4;
      const ty = c.y + (sy * k * FAN_STEP) / 4;
      for (const o of cells) {
        if (Math.abs(o.x - tx) < 1 && Math.abs(o.y - ty) < 1) cap.set(`${o.x},${o.y}`, Math.min(cap.get(`${o.x},${o.y}`) ?? 99, k));
      }
    }
  }
  const fanTiles = cells.filter((c) => c.fan).length * fanN;
  const raise = (mirrorUpDown: boolean, spread: number) => {
    const height = new Map<string, number>(cells.map((c) => [`${c.x},${c.y}`, 1]));
    const seen = new Set<string>();
    const orbits: { keys: string[]; dist: number; fan: boolean; max: number }[] = [];
    for (const c of cells) {
      if (seen.has(`${c.x},${c.y}`)) continue;
      const mirrors = [[c.x, c.y], [cols - 1 - c.x, c.y]];
      if (mirrorUpDown) mirrors.push([c.x, rows - 1 - c.y], [cols - 1 - c.x, rows - 1 - c.y]);
      const keys = [...new Set(mirrors.map(([x, y]) => `${x},${y}`))];
      keys.forEach((key) => seen.add(key));
      orbits.push({ keys, dist: (c.x - cx) ** 2 + ((c.y - cy) * 1.2) ** 2, fan: c.fan, max: Math.min(maxPile, ...keys.map((k) => cap.get(k) ?? 99)) });
    }
    orbits.sort((a, b) => a.dist - b.dist);
    let remaining = tiles - cells.length - fanTiles;
    // First pass: towers in the middle, lower piles further out (the cap falls with the distance from the
    // centre; a larger spread lets the tall piles reach further out).
    orbits.forEach((o, i) => {
      const top = Math.max(2, maxPile - Math.floor(((i / orbits.length) * maxPile) / spread));
      for (let h = 2; h <= Math.min(top, o.max) && !o.fan; h++) {
        if (remaining < o.keys.length) break;
        o.keys.forEach((k) => height.set(k, h));
        remaining -= o.keys.length;
      }
    });
    // Second pass: top up evenly (also finds the small orbits that make the count exact).
    for (let round = 2; round <= maxPile; round++) {
      for (const o of orbits) {
        if (o.fan || round > o.max || remaining < o.keys.length || height.get(o.keys[0])! >= round) continue;
        o.keys.forEach((k) => height.set(k, round));
        remaining -= o.keys.length;
      }
    }
    return remaining === 0 ? height : null;
  };
  let height: Map<string, number> | null = null;
  for (const mirrorUpDown of upDown ? [true, false] : [false]) {
    for (const spread of [1, 1.5, 2, 3, 0.7, 0.5, 0.0001]) height ??= raise(mirrorUpDown, spread);
  }
  if (!height) throw new Error(`layout ${shape.id}: cannot reach ${tiles} tiles`);

  const positions: Pos[] = [];
  for (const c of cells) {
    const h = height.get(`${c.x},${c.y}`)!;
    for (let z = 0; z < h; z++) positions.push({ x: c.x * 4, y: c.y * 4, z });
    if (c.fan) {
      const sx = -Math.sign(c.x - cx); // each cluster steps toward the centre
      const sy = -Math.sign(c.y - cy);
      for (let k = 1; k <= fanN; k++) positions.push({ x: c.x * 4 + sx * k * FAN_STEP, y: c.y * 4 + sy * k * FAN_STEP, z: k });
    }
  }
  return { id: shape.id, name: { fr: shape.fr, en: shape.en }, positions };
}

const EASY: Shape[] = [
  { id: 'ring', fr: 'Anneau', en: 'Ring', art: ['11111111', '1......1', '1......1', '1......1', '1......1', '11111111'] },
  { id: 'diamond', fr: 'Losange', en: 'Diamond', art: ['..11..', '.1111.', '111111', '111111', '.1111.', '..11..'] },
  { id: 'islands', fr: 'Deux îles', en: 'Two islands', art: ['1111..1111', '1111..1111', '1111..1111', '1111..1111'] },
  { id: 'stairs', fr: 'Escaliers', en: 'Staircases', art: ['111....111', '11......11', '1..1111..1', '1..1111..1', '11......11', '111....111'] },
];

const MEDIUM: Shape[] = [
  { id: 'butterfly', fr: 'Papillon', en: 'Butterfly', art: ['111.1.111', '111111111', '.1111111.', '.1111111.', '111111111', '111.1.111'] },
  { id: 'cross', fr: 'Croix', en: 'Cross', art: ['11.....11', '.11...11.', '..11111..', '...111...', '..11111..', '.11...11.', '11.....11'].map((r) => r) },
  { id: 'arch', fr: 'Arche', en: 'Arch', art: ['..111111..', '.11....11.', '11......11', '11......11', '11......11', '11......11'] },
  {
    id: 'stairs-fan',
    fr: 'Escaliers',
    en: 'Staircases',
    fanN: 2,
    art: ['1111111111', '1f......f1', '1..1111..1', '1..1111..1', '1f......f1', '1111111111'],
  },
];

const HARD: Shape[] = [
  {
    id: 'double-ring',
    fr: 'Double anneau',
    en: 'Double ring',
    art: ['1111111111', '1........1', '1..1111..1', '1..1111..1', '1........1', '1111111111'],
  },
  { id: 'big-diamond', fr: 'Grand losange', en: 'Big diamond', art: ['....111....', '..1111111..', '11111111111', '..1111111..', '....111....'] },
  { id: 'four-islands', fr: 'Quatre îlots', en: 'Four islands', art: ['1111..1111', '1111..1111', '..........', '1111..1111', '1111..1111'] },
  {
    id: 'stairs-centre',
    fr: 'Escaliers et centre',
    en: 'Staircases and centre',
    fanN: 2,
    art: ['1111....1111', '1f1......1f1', '11..1111..11', '11..1111..11', '1f1......1f1', '1111....1111'],
  },
];

const VERY_HARD: Shape[] = [
  {
    id: 'big-butterfly',
    fr: 'Grand papillon',
    en: 'Big butterfly',
    fanN: 2,
    art: ['11111.1.11111', '1f111111111f1', '.11111111111.', '.11111111111.', '1f111111111f1', '11111.1.11111'],
  },
  {
    id: 'big-cross',
    fr: 'Grande croix',
    en: 'Big cross',
    art: ['111......111', '.111....111.', '..11111111..', '..11111111..', '.111....111.', '111......111'],
  },
  {
    id: 'big-arch',
    fr: 'Grande arche',
    en: 'Big arch',
    fanN: 2,
    art: ['..11111111..', '.111....111.', '111......111', '111......111', '111......111', '111.f..f.111'],
  },
  {
    id: 'islands-fans',
    fr: 'Îles et escaliers',
    en: 'Islands and staircases',
    fanN: 2,
    art: ['1f111..111f1', '11111..11111', '11111..11111', '1f111..111f1'],
  },
];

function level(
  id: Difficulty,
  number: number,
  tiles: number,
  maxPile: number,
  maxLayers: number,
  pictureCount: number,
  canLose: boolean,
  shapes: Shape[],
): LevelDef {
  return { id, number, tiles, maxPile, maxLayers, pictureCount, canLose, layouts: shapes.map((s) => build(s, tiles, maxPile)) };
}

export const LEVELS: Record<Difficulty, LevelDef> = {
  easy: level('easy', 1, 36, 2, 2, 6, false, EASY),
  medium: level('medium', 2, 54, 3, 3, 9, false, MEDIUM),
  hard: level('hard', 3, 72, 4, 4, 12, true, HARD),
  veryHard: level('veryHard', 4, 90, 4, 4, 15, true, VERY_HARD),
};

// A random layout of the level, never the one that was dealt last for that level.
const lastDealt: Partial<Record<Difficulty, string>> = {};

export function pickLayout(levelId: Difficulty, rng: Rng, avoid: string | undefined = lastDealt[levelId]): LayoutDef {
  const all = LEVELS[levelId].layouts;
  const options = all.filter((l) => l.id !== avoid);
  return options[Math.floor(rng() * options.length)] ?? all[0];
}

// Called once a board is really in use (not while it is only being prepared, which can happen twice in dev).
export function rememberLayout(levelId: Difficulty, layoutId: string): void {
  lastDealt[levelId] = layoutId;
}
