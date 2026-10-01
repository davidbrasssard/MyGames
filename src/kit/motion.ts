import type { Effects } from '../settings/settings';

// Gentle transitions follow the global Effects setting. Only transform and opacity are
// ever animated, always slowly and smoothly: nothing flashes, blinks or flickers.
export const EFFECT_PROFILES: Record<Effects, { fadeMs: number; liftRem: number }> = {
  full: { fadeMs: 700, liftRem: 1.25 },
  gentle: { fadeMs: 500, liftRem: 0.75 },
  minimal: { fadeMs: 250, liftRem: 0 }, // a short, soft fade with no movement
};

export function applyEffects(level: Effects): void {
  const root = document.documentElement;
  const profile = EFFECT_PROFILES[level];
  root.style.setProperty('--fx-dur', `${profile.fadeMs}ms`);
  root.style.setProperty('--fx-lift', `${profile.liftRem}rem`);
  root.dataset.effects = level;
}
