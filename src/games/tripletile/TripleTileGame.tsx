import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LEVEL_TEXT, useT } from '../../i18n/dictionary';
import { pickStuckTitle } from '../../kit/NearMiss';
import { EndCard } from '../../kit/EndCard';
import { GameScreen, type GameAction, type GameProps } from '../../kit/GameScreen';
import { useMoveHistory } from '../../kit/history';
import { EFFECT_PROFILES } from '../../kit/motion';
import { playGood } from '../../kit/sound';
import { useDragGesture, type Point } from '../../kit/touch';
import { useElementSize } from '../../kit/useElementSize';
import { pictureName, pictureUrl } from '../../pictures';
import type { Picture } from '../../pictures/types';
import { TRIPLE_TILES_FLUENT } from '../../pictures/tripleTilesFluent';
import { setLevel, useSettings, type Difficulty } from '../../settings/settings';
import { StuckDecoration, WinDecoration } from '../mahjong/EndDecoration';
import { computeGeometry } from './geometry';
import { LEVELS } from './layouts';
import {
  createBoard,
  freeIds,
  hintTile,
  initialState,
  pickPictures,
  shuffled,
  tapTile,
  TRAY_SIZE,
  trayInsertIndex,
  undoMove,
  type Board,
  type GameState,
  type Move,
} from './rules';
import './tripletile.css';

const PICTURE_BY_ID = new Map<string, Picture>(TRIPLE_TILES_FLUENT.pictures.map((picture) => [picture.id, picture]));

const HINT_MS = 4500; // how long a hint stays visible
const CLEAR_PAUSE_MS = 120; // after the third tile has arrived, before the set clears
const WIN_PAUSE_MS = 1200; // pause after the last set, before the Bravo card
const STUCK_PAUSE_MS = 1500; // calm pause once the tray is full (Défi levels), before the Presque card

function newBoard(levelId: Difficulty): Board {
  const level = LEVELS[levelId];
  const ids = pickPictures(
    TRIPLE_TILES_FLUENT.pictures.map((picture) => picture.id),
    level.pictureCount,
    Math.random,
  );
  return createBoard(level.positions, ids, Math.random);
}

// The player's level is remembered per game. Picking a level (even the same one) deals a new board:
// the board is rebuilt from scratch through its key.
export function TripleTileGame(props: GameProps) {
  const { level } = useSettings();
  const [round, setRound] = useState(0);
  return (
    <TripleTileBoard
      key={`${level.tripletile}:${round}`}
      {...props}
      levelId={level.tripletile}
      onReplay={() => setRound((r) => r + 1)}
      onPickLevel={(next) => {
        setLevel('tripletile', next);
        setRound((r) => r + 1);
      }}
    />
  );
}

function TripleTileBoard({
  onBack,
  levelId,
  onPickLevel,
  onReplay,
}: GameProps & { levelId: Difficulty; onPickLevel: (level: Difficulty) => void; onReplay: () => void }) {
  const t = useT();
  const { hints, effects, language } = useSettings();
  const level = LEVELS[levelId];
  const fadeMs = EFFECT_PROFILES[effects].fadeMs;

  const [board] = useState<Board>(() => newBoard(levelId));
  const [game, setGame] = useState<GameState>(() => initialState(board));
  // What is drawn in the tray. It runs a moment ahead of game.tray: a set that just completed stays in its
  // slots until it has arrived, then fades away (goneSlots remembers where each cleared tile sat).
  const [shownTray, setShownTray] = useState<number[]>([]);
  const [goneSlots, setGoneSlots] = useState<ReadonlyMap<number, number>>(new Map());
  const [hint, setHint] = useState<number | null>(null);
  const [endCard, setEndCard] = useState<'win' | 'stuck' | null>(null);
  const history = useMoveHistory<Move>();

  const stateRef = useRef(game);
  stateRef.current = game;
  const timers = useRef<number[]>([]);
  const hintTimer = useRef<number | undefined>(undefined);
  const epoch = useRef(0); // bumped by Undo so a pending "set clears" step is dropped
  const busy = useRef(false); // a set is clearing: taps wait

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
  const [fieldRef, size] = useElementSize<HTMLDivElement>();
  const geometry = useMemo(
    () => (size.width > 0 && size.height > 0 ? computeGeometry(level.positions, size.width, size.height) : null),
    [level, size.width, size.height],
  );
  const freeSet = useMemo(() => new Set(freeIds(game.onBoard, board.covers)), [game.onBoard, board]);

  // Topmost board tile under a point (client px). The thickness under a tile counts as part of it.
  const tileAt = (point: Point): number | null => {
    const rect = fieldRef.current?.getBoundingClientRect();
    if (!geometry || !rect) return null;
    const x = point.x - rect.left;
    const y = point.y - rect.top;
    const { onBoard } = stateRef.current;
    let best: number | null = null;
    level.positions.forEach((pos, id) => {
      if (!onBoard[id]) return;
      const l = geometry.left[id];
      const tp = geometry.top[id];
      if (x < l || x > l + geometry.tw || y < tp || y > tp + geometry.th + geometry.t) return;
      if (best === null || pos.z >= level.positions[best].z) best = id;
    });
    return best;
  };

  // ---- Moves ----
  const clearHint = () => {
    window.clearTimeout(hintTimer.current);
    setHint(null);
  };

  const tap = (id: number) => {
    if (busy.current || endCard) return;
    const g = stateRef.current;
    const result = tapTile(board, g, id);
    if (!result) return; // blocked tile, or nothing can be played
    const inserted = g.tray.slice();
    inserted.splice(trayInsertIndex(g.tray, board.pictures[id], board.pictures), 0, id);
    const cleared = inserted.filter((tile) => !result.state.tray.includes(tile));

    history.push(result.move);
    stateRef.current = result.state;
    setGame(result.state);
    setShownTray(inserted);
    clearHint();

    if (cleared.length > 0) {
      busy.current = true;
      const mine = epoch.current;
      later(fadeMs + CLEAR_PAUSE_MS, () => {
        if (epoch.current !== mine) return;
        busy.current = false;
        playGood('tripletile');
        setGoneSlots((old) => {
          const grown = new Map(old);
          cleared.forEach((tile) => grown.set(tile, inserted.indexOf(tile)));
          return grown;
        });
        setShownTray((old) => old.filter((tile) => !cleared.includes(tile)));
      });
    }
  };

  const undo = () => {
    const move = history.undo();
    if (!move) return;
    epoch.current += 1;
    busy.current = false;
    const next = undoMove(stateRef.current, move);
    stateRef.current = next;
    setGame(next);
    setShownTray(move.trayBefore.slice());
    setGoneSlots((old) => {
      const shrunk = new Map(old);
      move.trayBefore.forEach((tile) => shrunk.delete(tile));
      shrunk.delete(move.tile);
      return shrunk;
    });
    clearHint();
  };

  const showHint = () => {
    const id = hintTile(board, stateRef.current);
    if (id === null) return;
    window.clearTimeout(hintTimer.current);
    setHint(id);
    hintTimer.current = window.setTimeout(() => setHint(null), HINT_MS);
  };

  // Tap only: a press that wanders into a drag does nothing.
  const handlers = useDragGesture<number>({
    pick: tileAt,
    onTap: tap,
    onDragStart: () => false,
  });

  // ---- Board cleared, or tray full ----
  useEffect(() => {
    if (game.status !== 'won') return undefined;
    const id = window.setTimeout(() => setEndCard('win'), fadeMs + CLEAR_PAUSE_MS + WIN_PAUSE_MS);
    return () => window.clearTimeout(id);
  }, [game.status, fadeMs]);

  // Défi levels only (the Détente rule for a full tray comes in the next step). Undo can still rescue it meanwhile.
  useEffect(() => {
    if (game.status !== 'stuck' || !level.canLose) return undefined;
    const id = window.setTimeout(() => setEndCard('stuck'), fadeMs + STUCK_PAUSE_MS);
    return () => window.clearTimeout(id);
  }, [game.status, level, fadeMs]);

  // ---- Dev-only test shortcuts (stripped from the production build) ----
  const devWin = () => {
    const next: GameState = { onBoard: board.positions.map(() => false), tray: [], status: 'won' };
    stateRef.current = next;
    setGame(next);
    setShownTray([]);
    clearHint();
    setEndCard('win');
  };
  const devStuck = () => {
    // Seven different pictures in the tray (as many as the level has), the rest stays on the board.
    const seen = new Set<string>();
    const tray: number[] = [];
    board.pictures.forEach((picture, id) => {
      if (tray.length < TRAY_SIZE && !seen.has(picture)) {
        seen.add(picture);
        tray.push(id);
      }
    });
    board.pictures.forEach((_, id) => {
      if (tray.length < TRAY_SIZE && !tray.includes(id)) tray.push(id);
    });
    const onBoard = board.positions.map((_, id) => !tray.includes(id));
    const next: GameState = { onBoard, tray, status: 'stuck' };
    stateRef.current = next;
    setGame(next);
    setShownTray(tray);
    clearHint();
    setEndCard('stuck');
  };

  // ---- Screen ----
  const stuckTitle = useMemo(() => (endCard === 'stuck' ? pickStuckTitle() : null), [endCard]);
  const endDecoration = useMemo(() => {
    if (!endCard) return null;
    const g = stateRef.current;
    if (endCard === 'stuck') {
      // The picture most present in the tray as the pair, and a different tray picture as the blocker.
      const counts = new Map<string, number>();
      g.tray.forEach((tile) => counts.set(board.pictures[tile], (counts.get(board.pictures[tile]) ?? 0) + 1));
      const byCount = [...counts].sort((a, b) => b[1] - a[1]).map(([p]) => p);
      const pairId = byCount[0] ?? board.pictures[0];
      const blockerId = byCount.find((p) => p !== pairId) ?? pairId;
      return (
        <StuckDecoration
          pair={PICTURE_BY_ID.get(pairId) as Picture}
          blocker={PICTURE_BY_ID.get(blockerId) as Picture}
          collection={TRIPLE_TILES_FLUENT}
        />
      );
    }
    const pics = shuffled([...new Set(board.pictures)], Math.random)
      .slice(0, 4)
      .map((id) => PICTURE_BY_ID.get(id) as Picture);
    return <WinDecoration pictures={pics} collection={TRIPLE_TILES_FLUENT} />;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endCard]);

  const actions: GameAction[] = [];
  if (hints) actions.push({ id: 'hint', onTap: showHint });
  actions.push({ id: 'undo', onTap: undo, disabled: !history.canUndo });

  return (
    <GameScreen
      title={t('gameTripleTile')}
      levelLabel={`${t('level')} ${level.number} · ${t(LEVEL_TEXT[level.id])}`}
      level={{
        current: levelId,
        detail: (l) => t('tilesCount').replace('{n}', String(LEVELS[l].positions.length)),
        kind: (l) => (LEVELS[l].canLose ? 'challenge' : 'relaxed'),
        onPick: onPickLevel,
      }}
      onBack={onBack}
      actions={actions}
      className="tt-screen"
      overlay={endCard && <EndCard kind={endCard} title={stuckTitle ? t(stuckTitle) : undefined} decoration={endDecoration} onReplay={onReplay} onHome={onBack} />}
    >
      <div
        ref={fieldRef}
        className="tt-field"
        style={geometry ? ({ '--tw': `${geometry.tw}px`, '--t': `${geometry.t}px` } as React.CSSProperties) : undefined}
        {...handlers}
      >
        {geometry && (
          <>
            <div
              className="tt-tray"
              style={{ left: geometry.trayLeft, top: geometry.trayTop, width: geometry.trayWidth, height: geometry.trayHeight }}
            />
            {geometry.slotLeft.map((left, k) => (
              <div key={k} className="tt-slot" style={{ left, top: geometry.slotTop, width: geometry.tw, height: geometry.th + geometry.t }} />
            ))}
            {board.positions.map((pos, id) => {
              const gone = goneSlots.get(id);
              const slot = shownTray.indexOf(id);
              let x: number;
              let y: number;
              let zIndex: number;
              if (gone !== undefined || slot >= 0) {
                const k = gone !== undefined ? gone : slot;
                x = geometry.slotLeft[k];
                y = geometry.slotTop;
                zIndex = 5000 + k;
              } else if (game.onBoard[id]) {
                x = geometry.left[id];
                y = geometry.top[id];
                zIndex = pos.z * 1000 + pos.y;
              } else {
                return null;
              }
              const picture = PICTURE_BY_ID.get(board.pictures[id]) as Picture;
              const onBoard = gone === undefined && slot < 0;
              return (
                <div
                  key={id}
                  className="tt-tile"
                  data-blocked={onBoard && !freeSet.has(id) ? 'true' : undefined}
                  data-hint={hint === id ? 'true' : undefined}
                  data-gone={gone !== undefined ? 'true' : undefined}
                  style={{
                    width: geometry.tw,
                    height: geometry.th,
                    zIndex,
                    transform: `translate(${x}px, ${y}px)${gone !== undefined ? ' scale(1.2)' : ''}`,
                  }}
                >
                  <img src={pictureUrl(TRIPLE_TILES_FLUENT, picture)} alt={pictureName(picture, language)} draggable={false} />
                </div>
              );
            })}
          </>
        )}
      </div>
      {import.meta.env.DEV && (
        <div className="tt-dev">
          <button type="button" onClick={devWin}>Win</button>
          <button type="button" onClick={devStuck}>Stuck</button>
        </div>
      )}
    </GameScreen>
  );
}
