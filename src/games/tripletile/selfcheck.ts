// Used by scripts/selfcheck-triple-tile.mjs (dev only, not imported by the app).
import { LEVELS, pickLayout } from './layouts';
import { createBoard, hintTile, initialState, pickPictures, TILE_UNITS, tapTile, undoMove, type Move } from './rules';
import { TRIPLE_TILES_FLUENT } from '../../pictures/tripleTilesFluent';

// Checks every layout of every level (shape, symmetry, no flat overlaps, exact counts) and plays
// `boards` random boards on each one through the real rules.
export function runSelfCheck(boards: number): boolean {
  const ids = TRIPLE_TILES_FLUENT.pictures.map((p) => p.id);
  let allOk = true;
  for (const def of Object.values(LEVELS)) {
    if (def.layouts.length !== 8) {
      allOk = false;
      console.log(`${def.id}: ${def.layouts.length} layouts, expected 8`);
    }
    for (const layout of def.layouts) {
      const { positions } = layout;
      const errors: string[] = [];
      const layers = Math.max(...positions.map((p) => p.z)) + 1;
      const piles = new Map<string, number>();
      positions.forEach((p) => piles.set(`${p.x},${p.y}`, (piles.get(`${p.x},${p.y}`) ?? 0) + 1));
      const deepest = Math.max(...piles.values());
      if (positions.length !== def.tiles) errors.push(`layout has ${positions.length} tiles`);
      if (layers > def.maxLayers) errors.push(`${layers} layers (max ${def.maxLayers})`);
      if (deepest > def.maxPile) errors.push(`pile of ${deepest} (max ${def.maxPile})`);
      if (new Set(positions.map((p) => `${p.x},${p.y},${p.z}`)).size !== positions.length) errors.push('two tiles in the same place');
      // tiles on the same layer must never overlap
      for (let i = 0; i < positions.length; i++)
        for (let j = i + 1; j < positions.length; j++) {
          const a = positions[i];
          const b = positions[j];
          if (a.z === b.z && Math.abs(a.x - b.x) < TILE_UNITS && Math.abs(a.y - b.y) < TILE_UNITS) errors.push(`tiles ${i} and ${j} overlap on layer ${a.z}`);
        }
      // nothing sticks out: every tile sits inside the outline of the bottom layer
      const base = positions.filter((p) => p.z === 0);
      const [bx0, bx1] = [Math.min(...base.map((p) => p.x)), Math.max(...base.map((p) => p.x))];
      const [by0, by1] = [Math.min(...base.map((p) => p.y)), Math.max(...base.map((p) => p.y))];
      if (positions.some((p) => p.x < bx0 || p.x > bx1 || p.y < by0 || p.y > by1)) errors.push('a tile sticks out of the outline');
      // left-right symmetric: the mirrored position exists on the same layer
      const keys = new Set(positions.map((p) => `${p.x},${p.y},${p.z}`));
      const span = Math.min(...positions.map((p) => p.x)) + Math.max(...positions.map((p) => p.x));
      if (!positions.every((p) => keys.has(`${span - p.x},${p.y},${p.z}`))) errors.push('layout not left-right symmetric');

      let maxTray = 0;
      for (let b = 0; b < boards; b++) {
        const pics = pickPictures(ids, def.pictureCount, Math.random);
        const board = createBoard(positions, pics, Math.random);
        const counts = new Map<string, number>();
        board.pictures.forEach((p) => counts.set(p, (counts.get(p) ?? 0) + 1));
        if (board.pictures.length !== def.tiles || counts.size !== def.pictureCount) errors.push(`board ${b}: bad counts`);
        if (Array.from(counts.values()).some((c) => c !== (def.tiles / def.pictureCount))) errors.push(`board ${b}: uneven sets`);

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
        if (errors.length > 8) break;
      }
      const ok = errors.length === 0;
      allOk = allOk && ok;
      console.log(`${def.id.padEnd(9)} ${layout.id.padEnd(14)} ${ok ? 'OK ' : 'FAIL'} tiles=${def.tiles} layers=${layers} deepest=${deepest} boards=${boards} maxTray=${maxTray}`);
      errors.slice(0, 5).forEach((e) => console.log('   ' + e));
    }
  }

  // Dealing: a random layout each time, never the same one twice in a row, and all of them come up.
  for (const def of Object.values(LEVELS)) {
    let last: string | undefined;
    const used = new Set<string>();
    let repeats = 0;
    for (let i = 0; i < 2000; i++) {
      const l = pickLayout(def.id, Math.random, last);
      if (l.id === last) repeats++;
      used.add(l.id);
      last = l.id;
    }
    const ok = repeats === 0 && used.size === def.layouts.length;
    allOk = allOk && ok;
    console.log(`${def.id.padEnd(9)} dealing ${ok ? 'OK ' : 'FAIL'} layoutsUsed=${used.size}/${def.layouts.length} repeats=${repeats}`);
  }
  return allOk;
}
