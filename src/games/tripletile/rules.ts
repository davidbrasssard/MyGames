// Triple Tile rules, kept free of React so they can be tested on their own.
// Tiles are identified by their index in the layout. Positions are in quarter-tile units
// (a tile covers 4x4 units), so upper layers can sit a small diagonal offset from the layer below.

export interface Pos {
  x: number; // quarter-tile units, left to right
  y: number; // quarter-tile units, top to bottom
  z: number; // layer, 0 = bottom
}

export type Rng = () => number;

export const TILE_UNITS = 4; // a tile is 4x4 position units
export const TRAY_SIZE = 7;
export const SET_SIZE = 3;

// above[i] = the tiles that cover tile i: higher layers that overlap it by any amount (any offset, the
// squares are 4 units wide). A tile is free when none of them is left.
export function buildCovers(positions: readonly Pos[]): number[][] {
  return positions.map((a, i) => {
    const covers: number[] = [];
    positions.forEach((b, j) => {
      if (i !== j && b.z > a.z && Math.abs(b.x - a.x) < TILE_UNITS && Math.abs(b.y - a.y) < TILE_UNITS) covers.push(j);
    });
    return covers;
  });
}

export function isFree(i: number, onBoard: ArrayLike<boolean>, covers: readonly number[][]): boolean {
  return onBoard[i] && covers[i].every((j) => !onBoard[j]);
}

export function freeIds(onBoard: ArrayLike<boolean>, covers: readonly number[][]): number[] {
  const ids: number[] = [];
  for (let i = 0; i < covers.length; i++) if (isFree(i, onBoard, covers)) ids.push(i);
  return ids;
}

export function shuffled<T>(items: readonly T[], rng: Rng): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export interface Board {
  positions: Pos[];
  pictures: string[]; // picture id of each tile
  covers: number[][];
  order: number[]; // the generation order: a valid way to clear the whole board
}

// A new board that can always be cleared. It plays the game "forwards" on empty positions: it takes a
// random free tile, over and over, and gives each consecutive group of 3 in that order the same
// picture. Playing that order never holds more than 2 tiles in the tray, so it is a solution.
// Sets are spread evenly: every picture gets the same number of sets (shuffled).
export function createBoard(positions: readonly Pos[], pictureIds: readonly string[], rng: Rng): Board {
  const n = positions.length;
  const sets = n / SET_SIZE;
  if (!Number.isInteger(sets) || pictureIds.length === 0) throw new Error('Tile count must be a multiple of 3');

  const labels: string[] = [];
  for (let s = 0; s < sets; s++) labels.push(pictureIds[s % pictureIds.length]);
  const setLabels = shuffled(labels, rng);

  const covers = buildCovers(positions);
  const onBoard: boolean[] = new Array(n).fill(true);
  const pictures: string[] = new Array(n);
  const order: number[] = [];
  for (let step = 0; step < n; step++) {
    const free = freeIds(onBoard, covers);
    const tile = free[Math.floor(rng() * free.length)];
    onBoard[tile] = false;
    pictures[tile] = setLabels[Math.floor(step / SET_SIZE)];
    order.push(tile);
  }
  return { positions: positions.slice(), pictures, covers, order };
}

// Picks `count` pictures at random from a collection's ids.
export function pickPictures(allIds: readonly string[], count: number, rng: Rng): string[] {
  return shuffled(allIds, rng).slice(0, count);
}

export type Status = 'playing' | 'won' | 'stuck';

export interface GameState {
  onBoard: boolean[];
  tray: number[]; // tile ids, in tray order (left to right)
  status: Status;
}

// One reversible move: the tile that was tapped and the tray as it was before.
export interface Move {
  tile: number;
  trayBefore: number[];
}

export function initialState(board: Board): GameState {
  return { onBoard: board.positions.map(() => true), tray: [], status: 'playing' };
}

// Where a tile of this picture goes: right after the identical pictures already there, else at the end.
export function trayInsertIndex(tray: readonly number[], picture: string, pictures: readonly string[]): number {
  let last = -1;
  tray.forEach((t, k) => {
    if (pictures[t] === picture) last = k;
  });
  return last === -1 ? tray.length : last + 1;
}

// Taps a tile. Returns the new state and the move to push on the history, or null when the tap does nothing
// (tile not free, tray already full, game over).
export function tapTile(board: Board, state: GameState, tile: number): { state: GameState; move: Move } | null {
  if (state.status !== 'playing' || state.tray.length >= TRAY_SIZE) return null;
  if (!isFree(tile, state.onBoard, board.covers)) return null;

  const picture = board.pictures[tile];
  const onBoard = state.onBoard.slice();
  onBoard[tile] = false;
  let tray = state.tray.slice();
  tray.splice(trayInsertIndex(tray, picture, board.pictures), 0, tile);
  if (tray.filter((t) => board.pictures[t] === picture).length >= SET_SIZE) {
    tray = tray.filter((t) => board.pictures[t] !== picture);
  }

  let status: Status = 'playing';
  if (!onBoard.some(Boolean) && tray.length === 0) status = 'won';
  else if (tray.length >= TRAY_SIZE) status = 'stuck';
  return { state: { onBoard, tray, status }, move: { tile, trayBefore: state.tray.slice() } };
}

// Takes a move back: the tile returns to its board spot and the tray is restored (including a clear).
export function undoMove(state: GameState, move: Move): GameState {
  const onBoard = state.onBoard.slice();
  onBoard[move.tile] = true;
  return { onBoard, tray: move.trayBefore.slice(), status: 'playing' };
}

// The tile to point at: 1) a free tile that completes a set in the tray, 2) one matching a tray picture,
// 3) the free tile whose picture has the most free copies. Null when nothing safe can be played.
export function hintTile(board: Board, state: GameState, rng: Rng = Math.random): number | null {
  if (state.status !== 'playing' || state.tray.length >= TRAY_SIZE) return null;
  const inTray = new Map<string, number>();
  for (const t of state.tray) inTray.set(board.pictures[t], (inTray.get(board.pictures[t]) ?? 0) + 1);
  // Never point at a tile that would fill the tray without clearing a set (that would end the game).
  const fillsTray = state.tray.length + 1 >= TRAY_SIZE;
  const free = freeIds(state.onBoard, board.covers).filter(
    (t) => !fillsTray || (inTray.get(board.pictures[t]) ?? 0) >= SET_SIZE - 1,
  );
  if (free.length === 0) return null;
  const pick = (ids: number[]) => ids[Math.floor(rng() * ids.length)];

  const completes = free.filter((t) => (inTray.get(board.pictures[t]) ?? 0) >= SET_SIZE - 1);
  if (completes.length) return pick(completes);
  const matches = free.filter((t) => (inTray.get(board.pictures[t]) ?? 0) > 0);
  if (matches.length) return pick(matches);

  const freeCopies = new Map<string, number>();
  for (const t of free) freeCopies.set(board.pictures[t], (freeCopies.get(board.pictures[t]) ?? 0) + 1);
  const best = Math.max(...Array.from(freeCopies.values()));
  return pick(free.filter((t) => freeCopies.get(board.pictures[t]) === best));
}
