import type { ReactNode } from 'react';
import type { TextKey } from '../i18n/dictionary';
import './NearMiss.css';

// The stuck (Presque) end-card decoration, shared by every game: "near miss". Three pieces in a row: an identical PAIR
// on the left and right and a different, slightly faded piece between them (the blocker). The pair slides slowly toward
// each other, stops just short of the middle piece (which rises a hair), pauses and drifts back to rest (about 4.5 s, once).
// Pieces are already rendered by the game (each about 4.6rem x 5.6rem) for the 9rem-high, full-width EndCard decoration area.
// Transform and opacity only; Gentle = smaller and shorter, Minimal = static (see NearMiss.css).
export function NearMiss({ pair, blocker }: { pair: [ReactNode, ReactNode]; blocker: ReactNode }) {
  return (
    <div className="nm">
      <div className="nm-tile nm-left">{pair[0]}</div>
      <div className="nm-tile nm-middle">{blocker}</div>
      <div className="nm-tile nm-right">{pair[1]}</div>
    </div>
  );
}

// Rotating titles for the stuck card (the line under them is always "Try again?").
export const STUCK_TITLES: TextKey[] = ['endStuck', 'endStuckNot', 'endStuckClose'];

const STORAGE_KEY = 'oasis.lastStuckTitle';

// A random title, never the same as the previous stuck card on this device.
export function pickStuckTitle(): TextKey {
  let last: string | null = null;
  try {
    last = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    // storage unavailable: fine, only the repeat guard is lost
  }
  const choices = STUCK_TITLES.filter((key) => key !== last);
  const key = choices[Math.floor(Math.random() * choices.length)];
  try {
    window.localStorage.setItem(STORAGE_KEY, key);
  } catch {
    // ignore
  }
  return key;
}
