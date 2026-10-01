import { useEffect, useMemo, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from 'react';
import { getScale } from './scale';

// Forgiving shared touch system (CONCEPT.md, "Touch"). Distances are in design pixels
// (1280x800 base) and are multiplied by the current layout scale.
export const TOUCH = {
  tapWobble: 24, // a tap may wander this far between press and release
  swipeMinDistance: 140, // a swipe needs a good distance...
  swipeMaxSlope: 0.5, // ...that is mostly sideways (vertical drift <= half of horizontal)
  swipeMaxMs: 1200,
  doubleTapMs: 400, // a second tap this soon and this close is ignored
  doubleTapRadius: 40,
  palmSize: 90, // touch contacts bigger than this (CSS px) are a resting palm, not a finger
  holdWobble: 40, // a press-and-hold may drift this far
  staleMs: 10000, // safety: forget a pointer that never reported its release
};

interface PointerLike {
  pointerId: number;
  pointerType: string;
  width: number;
  height: number;
}

// ---- One finger at a time ----
// The first finger owns the gesture. A second finger, or a resting palm, is ignored.
let ownerId: number | null = null;
let ownerAt = 0;

export function claimPointer(e: PointerLike): boolean {
  if (e.pointerType === 'touch' && Math.max(e.width, e.height) > TOUCH.palmSize) return false;
  const now = performance.now();
  if (ownerId !== null && ownerId !== e.pointerId && now - ownerAt < TOUCH.staleMs) return false;
  ownerId = e.pointerId;
  ownerAt = now;
  return true;
}

function releasePointer(e: PointerEvent): void {
  if (ownerId === e.pointerId) ownerId = null;
}

if (typeof window !== 'undefined') {
  window.addEventListener('pointerup', releasePointer, true);
  window.addEventListener('pointercancel', releasePointer, true);
  window.addEventListener('blur', () => {
    ownerId = null;
  });
}

// ---- Accidental double taps ----
let lastTap = { t: -Infinity, x: 0, y: 0 };

export function acceptTap(x: number, y: number): boolean {
  const now = performance.now();
  const near = Math.hypot(x - lastTap.x, y - lastTap.y) <= TOUCH.doubleTapRadius * getScale();
  if (now - lastTap.t < TOUCH.doubleTapMs && near) return false;
  lastTap = { t: now, x, y };
  return true;
}

// ---- Tap and swipe on an element ----
export type SwipeDirection = 'left' | 'right';

export interface TouchOptions {
  onTap?: () => void; // fires on release, with wobble tolerance
  onSwipe?: (direction: SwipeDirection) => void; // only a clear sideways movement
  disabled?: boolean;
}

interface Gesture {
  id: number;
  x: number;
  y: number;
  t: number;
  maxDistance: number;
}

type PointerHandler = (e: ReactPointerEvent<HTMLElement>) => void;

export interface TouchHandlers {
  onPointerDown: PointerHandler;
  onPointerMove: PointerHandler;
  onPointerUp: PointerHandler;
  onPointerCancel: PointerHandler;
  onPointerLeave: PointerHandler;
  onClick: (e: ReactMouseEvent<HTMLElement>) => void;
}

export function useTouch(options: TouchOptions): { handlers: TouchHandlers; pressed: boolean } {
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const gestureRef = useRef<Gesture | null>(null);
  const [pressed, setPressed] = useState(false);

  const handlers = useMemo<TouchHandlers>(() => {
    const end = () => {
      gestureRef.current = null;
      setPressed(false);
    };
    return {
      onPointerDown(e) {
        if (optionsRef.current.disabled) return;
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        const g = gestureRef.current;
        if (g && g.id !== e.pointerId && performance.now() - g.t < TOUCH.staleMs) return;
        if (!claimPointer(e)) return;
        gestureRef.current = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now(), maxDistance: 0 };
        setPressed(true);
      },
      onPointerMove(e) {
        const g = gestureRef.current;
        if (!g || g.id !== e.pointerId) return;
        g.maxDistance = Math.max(g.maxDistance, Math.hypot(e.clientX - g.x, e.clientY - g.y));
        if (g.maxDistance > TOUCH.tapWobble * getScale()) setPressed(false);
      },
      onPointerUp(e) {
        const g = gestureRef.current;
        if (!g || g.id !== e.pointerId) return;
        end();
        const { onTap, onSwipe } = optionsRef.current;
        const k = getScale();
        if (g.maxDistance <= TOUCH.tapWobble * k) {
          if (onTap && acceptTap(e.clientX, e.clientY)) onTap();
          return;
        }
        const dx = e.clientX - g.x;
        const dy = e.clientY - g.y;
        const quick = performance.now() - g.t <= TOUCH.swipeMaxMs;
        const far = Math.abs(dx) >= TOUCH.swipeMinDistance * k;
        const sideways = Math.abs(dy) <= TOUCH.swipeMaxSlope * Math.abs(dx);
        if (onSwipe && quick && far && sideways) onSwipe(dx < 0 ? 'left' : 'right');
      },
      onPointerCancel(e) {
        if (gestureRef.current?.id === e.pointerId) end();
      },
      onPointerLeave(e) {
        // Only a mouse can leave without releasing; touch keeps its pointer.
        if (e.pointerType === 'mouse' && gestureRef.current?.id === e.pointerId) end();
      },
      onClick(e) {
        // detail === 0 is a keyboard activation (Enter / Space). Pointer taps are handled above.
        if (e.detail === 0 && !optionsRef.current.disabled) optionsRef.current.onTap?.();
      },
    };
  }, []);

  return { handlers, pressed };
}

// ---- Press and hold (used by the settings gear) ----
export interface HoldOptions {
  ms: number;
  onComplete: () => void;
}

export function useHold({ ms, onComplete }: HoldOptions): {
  handlers: Pick<TouchHandlers, 'onPointerDown' | 'onPointerMove' | 'onPointerUp' | 'onPointerCancel' | 'onPointerLeave'>;
  holding: boolean;
} {
  const optionsRef = useRef({ ms, onComplete });
  optionsRef.current = { ms, onComplete };
  const stateRef = useRef<{ id: number; x: number; y: number; timer: number } | null>(null);
  const [holding, setHolding] = useState(false);

  const handlers = useMemo(() => {
    const cancel = () => {
      const s = stateRef.current;
      if (s) window.clearTimeout(s.timer);
      stateRef.current = null;
      setHolding(false);
    };
    return {
      onPointerDown(e: ReactPointerEvent<HTMLElement>) {
        if (stateRef.current) return;
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        if (!claimPointer(e)) return;
        const timer = window.setTimeout(() => {
          cancel();
          optionsRef.current.onComplete();
        }, optionsRef.current.ms);
        stateRef.current = { id: e.pointerId, x: e.clientX, y: e.clientY, timer };
        setHolding(true);
      },
      onPointerMove(e: ReactPointerEvent<HTMLElement>) {
        const s = stateRef.current;
        if (!s || s.id !== e.pointerId) return;
        if (Math.hypot(e.clientX - s.x, e.clientY - s.y) > TOUCH.holdWobble * getScale()) cancel();
      },
      onPointerUp(e: ReactPointerEvent<HTMLElement>) {
        if (stateRef.current?.id === e.pointerId) cancel();
      },
      onPointerCancel(e: ReactPointerEvent<HTMLElement>) {
        if (stateRef.current?.id === e.pointerId) cancel();
      },
      onPointerLeave(e: ReactPointerEvent<HTMLElement>) {
        if (e.pointerType === 'mouse' && stateRef.current?.id === e.pointerId) cancel();
      },
    };
  }, []);

  useEffect(
    () => () => {
      const s = stateRef.current;
      if (s) window.clearTimeout(s.timer);
    },
    [],
  );

  return { handlers, holding };
}

// ---- Tap and drag on a board of pieces (used by tile / card / puzzle games) ----
// One set of handlers goes on the board element. `pick` says which piece is under a point
// (client coordinates). A press that stays within the wobble is a tap; a press that moves
// further is a drag of that piece, reported until release. Drag and Tap-Tap are both always on.
export interface Point {
  x: number;
  y: number;
}

export interface DragOptions<T> {
  pick: (point: Point) => T | null;
  onTap?: (item: T) => void;
  onDragStart?: (item: T) => boolean | void; // return false to refuse (the press then does nothing)
  onDragMove?: (item: T, delta: Point, point: Point) => void;
  onDragEnd?: (item: T, delta: Point, point: Point) => void; // released after a drag: the drop
  onDragCancel?: (item: T) => void; // the system took the touch away
}

type DragHandlers = Pick<TouchHandlers, 'onPointerDown' | 'onPointerMove' | 'onPointerUp' | 'onPointerCancel'>;

export function useDragGesture<T>(options: DragOptions<T>): DragHandlers {
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const gestureRef = useRef<{
    id: number;
    item: T;
    start: Point;
    dragging: boolean;
    refused: boolean;
    maxDistance: number;
  } | null>(null);

  return useMemo<DragHandlers>(
    () => ({
      onPointerDown(e) {
        if (gestureRef.current && gestureRef.current.id !== e.pointerId) return;
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        if (!claimPointer(e)) return;
        const point = { x: e.clientX, y: e.clientY };
        const item = optionsRef.current.pick(point);
        if (item === null) return;
        try {
          e.currentTarget.setPointerCapture(e.pointerId); // keep receiving moves outside the board
        } catch {
          // not supported: moves still arrive while the pointer stays over the board
        }
        gestureRef.current = { id: e.pointerId, item, start: point, dragging: false, refused: false, maxDistance: 0 };
      },
      onPointerMove(e) {
        const g = gestureRef.current;
        if (!g || g.id !== e.pointerId || g.refused) return;
        const delta = { x: e.clientX - g.start.x, y: e.clientY - g.start.y };
        g.maxDistance = Math.max(g.maxDistance, Math.hypot(delta.x, delta.y));
        if (!g.dragging && g.maxDistance > TOUCH.tapWobble * getScale()) {
          if (optionsRef.current.onDragStart?.(g.item) === false) {
            g.refused = true;
            return;
          }
          g.dragging = true;
        }
        if (g.dragging) optionsRef.current.onDragMove?.(g.item, delta, { x: e.clientX, y: e.clientY });
      },
      onPointerUp(e) {
        const g = gestureRef.current;
        if (!g || g.id !== e.pointerId) return;
        gestureRef.current = null;
        if (g.refused) return;
        const point = { x: e.clientX, y: e.clientY };
        if (g.dragging) {
          optionsRef.current.onDragEnd?.(g.item, { x: point.x - g.start.x, y: point.y - g.start.y }, point);
        } else if (acceptTap(point.x, point.y)) {
          optionsRef.current.onTap?.(g.item);
        }
      },
      onPointerCancel(e) {
        const g = gestureRef.current;
        if (!g || g.id !== e.pointerId) return;
        gestureRef.current = null;
        if (g.dragging) optionsRef.current.onDragCancel?.(g.item);
      },
    }),
    [],
  );
}
