import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LEVEL_TEXT, useT } from '../../i18n/dictionary';
import { GameScreen, type GameAction, type GameProps } from '../../kit/GameScreen';
import { Tile, type TileState } from '../../kit/Tile';
import { useMoveHistory } from '../../kit/history';
import { EFFECT_PROFILES } from '../../kit/motion';
import { useDragGesture, type Point } from '../../kit/touch';
import { useElementSize } from '../../kit/useElementSize';
import type { Picture } from '../../pictures/types';
import { TILES_FLUENT } from '../../pictures/tilesFluent';
import { useSettings } from '../../settings/settings';
import { computeGeometry } from './geometry';
import { LEVELS, type LevelDef } from './layouts';
import { buildBlockers, createBoard, findFreePairs, freeIds, isFree, reshuffle, shuffled } from './rules';
import './mahjong.css';

const PICTURE_BY_ID = new Map<string, Picture>(TILES_FLUENT.pictures.map((picture) => [picture.id, picture]));

const HINT_MS = 4500; // how long a hint stays visible
const WIN_PAUSE_MS = 1200; // pause after the last pair, before going Home (completion screen comes later)

interface GameState {
  pictures: string[]; // picture id of each tile
  removed: boolean[];
}

// What one move is, so it can be taken back: the two tiles and their picture.
interface Move {
  a: number;
  b: number;
  picture: string;
}

// A different random selection of pictures every game.
function newGame(level: LevelDef): GameState {
  const ids = shuffled(
    TILES_FLUENT.pictures.map((picture) => picture.id),
    Math.random,
  ).slice(0, level.positions.length / level.copies);
  return {
    pictures: createBoard(level.positions, ids, level.copies, Math.random),
    removed: new Array<boolean>(level.positions.length).fill(false),
  };
}

export function MahjongGame({ onBack, onComplete }: GameProps) {
  const t = useT();
  const { difficulty, hints, effects } = useSettings();
  const level = LEVELS[difficulty.mahjong];
  const fadeMs = EFFECT_PROFILES[effects].fadeMs;
  const blockers = useMemo(() => buildBlockers(level.positions), [level]);

  const [game, setGame] = useState<GameState>(() => newGame(level));
  const [selected, setSelected] = useState<number | null>(null);
  const [hint, setHint] = useState<[number, number] | null>(null);
  const [hidden, setHidden] = useState<ReadonlySet<number>>(new Set()); // removed and fully faded: not drawn
  const [returning, setReturning] = useState<ReadonlySet<number>>(new Set()); // brought back by Undo
  const [shuffling, setShuffling] = useState(false);
  const history = useMoveHistory<Move>();

  // Always the latest state, for timers and for several events in a row.
  const stateRef = useRef(game);
  stateRef.current = game;
  const timers = useRef<number[]>([]);
  const hintTimer = useRef<number | undefined>(undefined);
  const dragRef = useRef<{ id: number; el: HTMLElement; zIndex: string; cx: number; cy: number } | null>(null);

  const later = useCallback((ms: number, fn: () => void) => {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
    return id;
  }, []);
  useEffect(
    () => () => {
      timers.current.forEach((id) => window.clearTimeout(id));
      window.clearTimeout(hintTimer.current);
    },
    [],
  );

  // ---- Board geometry ----
  const [boardRef, size] = useElementSize<HTMLDivElement>();
  const geometry = useMemo(
    () => (size.width > 0 && size.height > 0 ? computeGeometry(level.positions, size.width, size.height) : null),
    [level, size.width, size.height],
  );

  const topLayer = useMemo(() => Math.max(...level.positions.map((p) => p.z)), [level]);

  const freeSet = useMemo(() => new Set(freeIds(game.removed, blockers)), [game.removed, blockers]);

  // Topmost tile under a point (board-relative px). The visible side thickness counts as part of the tile.
  const tileAt = (x: number, y: number, exclude = -1): number | null => {
    if (!geometry) return null;
    let best: number | null = null;
    const { removed } = stateRef.current;
    level.positions.forEach((pos, id) => {
      if (removed[id] || id === exclude) return;
      const l = geometry.left[id];
      const tp = geometry.top[id];
      if (x < l - geometry.t || x > l + geometry.tw || y < tp || y > tp + geometry.th + geometry.t) return;
      if (best === null || pos.z >= level.positions[best].z) best = id;
    });
    return best;
  };

  const toBoard = (point: Point): Point => {
    const rect = boardRef.current?.getBoundingClientRect();
    return rect ? { x: point.x - rect.left, y: point.y - rect.top } : point;
  };

  // The free tile with the same picture that a dragged tile was dropped on (a little forgiving).
  const dropTarget = (point: Point, dragId: number): number | null => {
    if (!geometry) return null;
    const g = stateRef.current;
    const { x, y } = toBoard(point);
    const picture = g.pictures[dragId];
    const matches = (id: number | null): id is number =>
      id !== null && id !== dragId && g.pictures[id] === picture && isFree(id, g.removed, blockers);

    const exact = tileAt(x, y, dragId);
    if (matches(exact)) return exact;

    const slack = geometry.tw * 0.2;
    let best: number | null = null;
    let bestDistance = Infinity;
    level.positions.forEach((_, id) => {
      if (!matches(id)) return;
      const l = geometry.left[id] - geometry.t - slack;
      const tp = geometry.top[id] - slack;
      const r = geometry.left[id] + geometry.tw + slack;
      const b = geometry.top[id] + geometry.th + geometry.t + slack;
      if (x < l || x > r || y < tp || y > b) return;
      const distance = Math.hypot(x - (l + r) / 2, y - (tp + b) / 2);
      if (distance < bestDistance) {
        best = id;
        bestDistance = distance;
      }
    });
    return best;
  };

  // ---- Moves ----
  const clearHint = () => {
    window.clearTimeout(hintTimer.current);
    setHint(null);
  };

  const removePair = (a: number, b: number) => {
    const g = stateRef.current;
    if (g.removed[a] || g.removed[b]) return;
    const removed = g.removed.slice();
    removed[a] = true;
    removed[b] = true;
    history.push({ a, b, picture: g.pictures[a] });
    const next = { ...g, removed };
    stateRef.current = next;
    setGame(next);
    setSelected(null);
    clearHint();
    // Once the glide-and-fade is over, stop drawing the two tiles.
    later(fadeMs + 80, () => {
      const now = stateRef.current.removed;
      setHidden((old) => {
        const grown = new Set(old);
        if (now[a]) grown.add(a);
        if (now[b]) grown.add(b);
        return grown;
      });
    });
  };

  const undo = () => {
    if (shuffling) return;
    const move = history.undo();
    if (!move) return;
    const g = stateRef.current;
    const removed = g.removed.slice();
    const pictures = g.pictures.slice();
    removed[move.a] = false;
    removed[move.b] = false;
    pictures[move.a] = move.picture;
    pictures[move.b] = move.picture;
    const next = { pictures, removed };
    stateRef.current = next;
    setGame(next);
    for (const id of [move.a, move.b]) {
      const el = boardRef.current?.querySelector<HTMLElement>(`[data-tile-id="${id}"]`);
      if (el) el.style.transform = ''; // a tile dropped by hand may still carry its drop position
    }
    setHidden((old) => {
      const shrunk = new Set(old);
      shrunk.delete(move.a);
      shrunk.delete(move.b);
      return shrunk;
    });
    setReturning((old) => new Set(old).add(move.a).add(move.b));
    later(fadeMs + 80, () =>
      setReturning((old) => {
        const shrunk = new Set(old);
        shrunk.delete(move.a);
        shrunk.delete(move.b);
        return shrunk;
      }),
    );
    setSelected(null);
    clearHint();
  };

  const showHint = () => {
    if (shuffling) return;
    const g = stateRef.current;
    const pairs = findFreePairs(g.pictures, g.removed, blockers);
    if (pairs.length === 0) return;
    setSelected(null);
    window.clearTimeout(hintTimer.current);
    setHint(pairs[Math.floor(Math.random() * pairs.length)]);
    hintTimer.current = window.setTimeout(() => setHint(null), HINT_MS);
  };

  // ---- Tap-Tap and Drag, both always on, through the shared touch system ----
  const handlers = useDragGesture<number>({
    pick: (point) => {
      if (shuffling) return null;
      const { x, y } = toBoard(point);
      return tileAt(x, y);
    },

    onTap: (id) => {
      const g = stateRef.current;
      if (!isFree(id, g.removed, blockers)) return; // blocked tiles do nothing
      clearHint();
      if (selected === null) setSelected(id);
      else if (selected === id) setSelected(null);
      else if (g.pictures[selected] === g.pictures[id] && isFree(selected, g.removed, blockers)) removePair(selected, id);
      else setSelected(id);
    },

    onDragStart: (id) => {
      const g = stateRef.current;
      if (!isFree(id, g.removed, blockers)) return false;
      const el = boardRef.current?.querySelector<HTMLElement>(`[data-tile-id="${id}"]`);
      if (!el) return false;
      const box = el.getBoundingClientRect();
      dragRef.current = { id, el, zIndex: el.style.zIndex, cx: box.left + box.width / 2, cy: box.top + box.height / 2 };
      el.dataset.dragging = 'true';
      el.style.zIndex = '100000';
      clearHint();
      return true;
    },

    onDragMove: (_id, delta) => {
      const drag = dragRef.current;
      if (!drag) return;
      // A dragged tile never leaves the screen.
      const dx = Math.max(-drag.cx, Math.min(window.innerWidth - drag.cx, delta.x));
      const dy = Math.max(-drag.cy, Math.min(window.innerHeight - drag.cy, delta.y));
      drag.el.style.transform = `translate(${dx}px, ${dy}px) scale(1.06)`;
    },

    onDragEnd: (id, _delta, point) => {
      const drag = dragRef.current;
      dragRef.current = null;
      if (!drag) return;
      drag.el.removeAttribute('data-dragging');
      const target = dropTarget(point, id);
      if (target !== null) {
        removePair(id, target); // the tile fades away where it was dropped
        later(fadeMs + 120, () => {
          drag.el.style.transform = '';
          drag.el.style.zIndex = drag.zIndex;
        });
      } else {
        drag.el.style.transform = ''; // glides back (CSS transition)
        later(400, () => {
          drag.el.style.zIndex = drag.zIndex;
        });
      }
    },

    onDragCancel: () => {
      const drag = dragRef.current;
      dragRef.current = null;
      if (!drag) return;
      drag.el.removeAttribute('data-dragging');
      drag.el.style.transform = '';
      later(400, () => {
        drag.el.style.zIndex = drag.zIndex;
      });
    },
  });

  // ---- Board cleared, or no free pair left ----
  const remaining = game.removed.filter((r) => !r).length;
  const stuck = remaining > 0 && findFreePairs(game.pictures, game.removed, blockers).length === 0;

  useEffect(() => {
    if (remaining > 0) return undefined;
    const id = window.setTimeout(onComplete, fadeMs + WIN_PAUSE_MS);
    return () => window.clearTimeout(id);
  }, [remaining, fadeMs, onComplete]);

  // No free matching pair: after the last pair has faded, the board fades out, the remaining tiles
  // are dealt again into a position that can be cleared, and the board fades back in. No message.
  useEffect(() => {
    if (!stuck || shuffling) return undefined;
    const id = window.setTimeout(() => setShuffling(true), fadeMs);
    return () => window.clearTimeout(id);
  }, [stuck, shuffling, game, fadeMs]);

  useEffect(() => {
    if (!shuffling) return undefined;
    const id = window.setTimeout(() => {
      const g = stateRef.current;
      const next = reshuffle(level.positions, g.pictures, g.removed, Math.random);
      if (next) {
        const dealt = { ...g, pictures: next };
        stateRef.current = dealt;
        setGame(dealt);
      }
      setSelected(null);
      setHint(null);
      setShuffling(false);
    }, fadeMs + 150);
    return () => window.clearTimeout(id);
  }, [shuffling, fadeMs, level]);

  // ---- Screen ----
  const actions: GameAction[] = [];
  if (hints) actions.push({ id: 'hint', onTap: showHint, disabled: shuffling });
  actions.push({ id: 'undo', onTap: undo, disabled: !history.canUndo || shuffling });

  const tileState = (id: number): TileState => {
    if (game.removed[id]) return 'removed';
    if (id === selected) return 'selected';
    return freeSet.has(id) ? 'normal' : 'blocked'; // blocked looks exactly like normal
  };

  return (
    <GameScreen
      title={t('gameMahjong')}
      levelLabel={`${t('level')} ${level.number} · ${t(LEVEL_TEXT[level.id])}`}
      onBack={onBack}
      actions={actions}
      caption={t('mahjongCaption')}
    >
      <div
        ref={boardRef}
        className="mj-board"
        style={geometry ? ({ '--tw': `${geometry.tw}px`, '--t': `${geometry.t}px` } as React.CSSProperties) : undefined}
        {...handlers}
      >
        {geometry && (
          <div className="mj-tiles" data-shuffling={shuffling}>
            {level.positions.map((pos, id) =>
              hidden.has(id) ? null : (
                <Tile
                  key={id}
                  tileId={id}
                  picture={PICTURE_BY_ID.get(game.pictures[id]) as Picture}
                  state={tileState(id)}
                  hint={hint !== null && (hint[0] === id || hint[1] === id)}
                  returning={returning.has(id)}
                  style={{ left: geometry.left[id], top: geometry.top[id], width: geometry.tw, height: geometry.th, zIndex: pos.z * 1000 + 500 + pos.y - pos.x }}
                  shade={topLayer - pos.z}
                />
              ),
            )}
          </div>
        )}
      </div>
    </GameScreen>
  );
}
