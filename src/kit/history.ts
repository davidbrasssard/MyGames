import { useCallback, useMemo, useRef, useState } from 'react';

// Generic move history, shared by every game. A game decides what a "move" is
// (for Mahjong: the two tiles removed and their picture) and how to reverse it.
export interface MoveHistory<M> {
  count: number;
  canUndo: boolean;
  push: (move: M) => void;
  undo: () => M | undefined; // takes the last move back out, or undefined when there is none
  clear: () => void;
}

export function useMoveHistory<M>(): MoveHistory<M> {
  const movesRef = useRef<M[]>([]);
  const [count, setCount] = useState(0);

  const push = useCallback((move: M) => {
    movesRef.current.push(move);
    setCount(movesRef.current.length);
  }, []);

  const undo = useCallback(() => {
    const move = movesRef.current.pop();
    setCount(movesRef.current.length);
    return move;
  }, []);

  const clear = useCallback(() => {
    movesRef.current = [];
    setCount(0);
  }, []);

  return useMemo(() => ({ count, canUndo: count > 0, push, undo, clear }), [count, push, undo, clear]);
}
