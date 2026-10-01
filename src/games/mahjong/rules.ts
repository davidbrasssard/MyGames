// Mahjong rules, kept free of React so they can be tested on their own.
// Tiles are identified by their index in the layout. Positions are in half-tile units:
// a tile covers 2x2 units, so neighbours can sit offset by half a tile, as in real Mahjong.

export interface Pos {
  x: number; // half-tile units, left to right
  y: number; // half-tile units, top to bottom
  z: number; // layer, 0 = bottom
}

export type Rng = () => number;

export interface Blockers {
  above: number[][]; // tiles that cover this one
  left: number[][]; // tiles that close its left side
  right: number[][]; // tiles that close its right side
}

export function buildBlockers(positions: readonly Pos[]): Blockers {
  const above: number[][] = [];
  const left: number[][] = [];
  const right: number[][] = [];
  positions.forEach((a, i) => {
    above[i] = [];
    left[i] = [];
    right[i] = [];
    positions.forEach((b, j) => {
      if (i === j) return;
      const overlapsY = Math.abs(b.y - a.y) < 2;
      if (b.z > a.z && overlapsY && Math.abs(b.x - a.x) < 2) above[i].push(j);
      if (b.z === a.z && overlapsY) {
        if (a.x - b.x > 0 && a.x - b.x <= 2) left[i].push(j);
        if (b.x - a.x > 0 && b.x - a.x <= 2) right[i].push(j);
      }
    });
  });
  return { above, left, right };
}

// A tile is free when nothing is on top of it and its left or its right side is open.
export function isFree(i: number, removed: ArrayLike<boolean>, blockers: Blockers): boolean {
  if (removed[i]) return false;
  if (blockers.above[i].some((j) => !removed[j])) return false;
  const leftOpen = blockers.left[i].every((j) => removed[j]);
  const rightOpen = blockers.right[i].every((j) => removed[j]);
  return leftOpen || rightOpen;
}

export function freeIds(removed: ArrayLike<boolean>, blockers: Blockers): number[] {
  const ids: number[] = [];
  for (let i = 0; i < blockers.above.length; i++) if (isFree(i, removed, blockers)) ids.push(i);
  return ids;
}

// Every pair of free tiles showing the same picture.
export function findFreePairs(
  pictures: readonly string[],
  removed: ArrayLike<boolean>,
  blockers: Blockers,
): [number, number][] {
  const free = freeIds(removed, blockers);
  const pairs: [number, number][] = [];
  for (let a = 0; a < free.length; a++) {
    for (let b = a + 1; b < free.length; b++) {
      if (pictures[free[a]] === pictures[free[b]]) pairs.push([free[a], free[b]]);
    }
  }
  return pairs;
}

export function shuffled<T>(items: readonly T[], rng: Rng): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// Gives every position a picture so that the board can always be cleared.
// It plays the game "forwards" on empty positions: it repeatedly takes two free positions and
// gives them the next pair label, so the order it used is a valid solution by construction.
// `labels` holds one entry per pair (a picture that must appear 4 times is listed twice).
export function solvableAssignment(positions: readonly Pos[], labels: readonly string[], rng: Rng): string[] | null {
  const n = positions.length;
  if (n === 0) return [];
  if (n % 2 !== 0 || labels.length !== n / 2) return null;
  const blockers = buildBlockers(positions);

  for (let attempt = 0; attempt < 60; attempt++) {
    const removed: boolean[] = new Array(n).fill(false);
    const pictures: string[] = new Array(n);
    const order = shuffled(labels, rng);
    let ok = true;

    for (let step = 0; step < n / 2 && ok; step++) {
      const free = shuffled(freeIds(removed, blockers), rng);
      if (free.length < 2) {
        ok = false;
        break;
      }
      // Prefer a pair that leaves at least two free tiles, so the chain never dries up.
      let chosen: [number, number] = [free[0], free[1]];
      if (step < n / 2 - 1) {
        search: for (let a = 0; a < free.length; a++) {
          for (let b = a + 1; b < free.length; b++) {
            removed[free[a]] = true;
            removed[free[b]] = true;
            const enough = freeIds(removed, blockers).length >= 2;
            removed[free[a]] = false;
            removed[free[b]] = false;
            if (enough) {
              chosen = [free[a], free[b]];
              break search;
            }
          }
        }
      }
      removed[chosen[0]] = true;
      removed[chosen[1]] = true;
      pictures[chosen[0]] = order[step];
      pictures[chosen[1]] = order[step];
    }
    if (ok) return pictures;
  }
  return null;
}

// A new board: `pictureIds` are the pictures used, each shown `copies` times (an even number).
export function createBoard(positions: readonly Pos[], pictureIds: readonly string[], copies: number, rng: Rng): string[] {
  const labels: string[] = [];
  for (const id of pictureIds) for (let c = 0; c < copies / 2; c++) labels.push(id);
  const result = solvableAssignment(positions, labels, rng);
  if (!result) throw new Error('Could not generate a solvable board for this layout');
  return result;
}

// Re-deals the pictures of the tiles still on the board into a position that can be cleared.
// Positions do not move. Returns null if no solvable deal was found (the board is left as it is).
export function reshuffle(
  positions: readonly Pos[],
  pictures: readonly string[],
  removed: ArrayLike<boolean>,
  rng: Rng,
): string[] | null {
  const present: number[] = [];
  for (let i = 0; i < positions.length; i++) if (!removed[i]) present.push(i);

  const counts = new Map<string, number>();
  for (const i of present) counts.set(pictures[i], (counts.get(pictures[i]) ?? 0) + 1);
  const labels: string[] = [];
  counts.forEach((count, picture) => {
    for (let c = 0; c < Math.floor(count / 2); c++) labels.push(picture);
  });

  const assignment = solvableAssignment(
    present.map((i) => positions[i]),
    labels,
    rng,
  );
  if (!assignment) return null;
  const next = pictures.slice();
  present.forEach((tileIndex, k) => {
    next[tileIndex] = assignment[k];
  });
  return next;
}
