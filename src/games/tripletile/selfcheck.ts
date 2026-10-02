// Used by scripts/selfcheck-triple-tile.mjs (dev only, not imported by the app).
import { LEVELS } from './layouts';
import { createBoard, hintTile, initialState, pickPictures, tapTile, undoMove, type Move } from './rules';
import { TRIPLE_TILES_FLUENT } from '../../pictures/tripleTilesFluent';

const EXPECTED: Record<string, { tiles: number; layers: number; pictures: number }> = {
  easy: { tiles: 36, layers: 2, pictures: 6 },
  medium: { tiles: 54, layers: 3, pictures: 9 },
  hard: { tiles: 72, layers: 3, pictures: 12 },
  veryHard: { tiles: 90, layers: 4, pictures: 15 },
};

export function runSelfCheck(boards: number): boolean {
  const ids = TRIPLE_TILES_FLUENT.pictures.map((p) => p.id);
  let allOk = true;
  for (const [level, def] of Object.entries(LEVELS)) {
    const exp = EXPECTED[level];
    const errors: string[] = [];
    const layers = new Set(def.positions.map((p) => p.z)).size;
    if (def.positions.length !== exp.tiles) errors.push(`layout has ${def.positions.length} tiles`);
    if (layers !== exp.layers) errors.push(`layout has ${layers} layers`);
    if (def.pictureCount !== exp.pictures) errors.push(`pictureCount ${def.pictureCount}`);
    // symmetric: mirrored position (left-right and top-bottom) exists on the same layer
    const key = (x: number, y: number, z: number) => `${x},${y},${z}`;
    const keys = new Set(def.positions.map((p) => key(p.x, p.y, p.z)));
    const cx = Math.max(...def.positions.map((p) => p.x)) / 2 + Math.min(...def.positions.map((p) => p.x)) / 2;
    const cy = Math.max(...def.positions.map((p) => p.y)) / 2 + Math.min(...def.positions.map((p) => p.y)) / 2;
    if (!def.positions.every((p) => keys.has(key(2 * cx - p.x, p.y, p.z)) && keys.has(key(p.x, 2 * cy - p.y, p.z))))
      errors.push('layout not symmetric');

    let maxTray = 0;
    for (let b = 0; b < boards; b++) {
      const pics = pickPictures(ids, def.pictureCount, Math.random);
      const board = createBoard(def.positions, pics, Math.random);
      const counts = new Map<string, number>();
      board.pictures.forEach((p) => counts.set(p, (counts.get(p) ?? 0) + 1));
      if (board.pictures.length !== exp.tiles || counts.size !== exp.pictures) errors.push(`board ${b}: bad counts`);
      if (Array.from(counts.values()).some((c) => c !== 6)) errors.push(`board ${b}: uneven sets`);

      // play the generation order, undo the whole game, then replay it
      for (let pass = 0; pass < 2; pass++) {
        let state = initialState(board);
        const moves: Move[] = [];
        for (const tile of board.order) {
          const hint = hintTile(board, state);
          if (hint === null) errors.push(`board ${b}: no hint while playing`);
          const r = tapTile(board, state, tile);
          if (!r) {
            errors.push(`board ${b}: tile ${tile} not playable in order`);
            break;
          }
          state = r.state;
          moves.push(r.move);
          maxTray = Math.max(maxTray, state.tray.length);
          if (state.status === 'stuck') errors.push(`board ${b}: stuck`);
        }
        if (state.status !== 'won') errors.push(`board ${b}: not won (${state.status})`);
        if (pass === 0) {
          while (moves.length) state = undoMove(state, moves.pop()!);
          if (state.onBoard.some((v) => !v) || state.tray.length) errors.push(`board ${b}: undo did not restore`);
        }
      }
    }
    const ok = errors.length === 0;
    allOk = allOk && ok;
    console.log(`${level.padEnd(9)} ${ok ? 'OK ' : 'FAIL'} tiles=${exp.tiles} layers=${layers} pictures=${exp.pictures} boards=${boards} maxTray=${maxTray}`);
    errors.slice(0, 5).forEach((e) => console.log('   ' + e));
  }
  return allOk;
}
