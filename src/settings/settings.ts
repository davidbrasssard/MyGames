import { useSyncExternalStore } from 'react';

// ---- Allowed values -------------------------------------------------------
export const LANGUAGES = ['fr', 'en'] as const;
export const DIFFICULTIES = ['easy', 'medium', 'hard', 'veryHard'] as const;
export const GAME_IDS = ['match', 'mahjong', 'match3', 'puzzles'] as const;
export const INPUT_MODES = ['both', 'drag', 'tap'] as const;
export const EFFECTS = ['full', 'gentle', 'minimal'] as const;
export const IMAGE_SIZES = ['large', 'medium', 'small'] as const;

export type Language = (typeof LANGUAGES)[number];
export type Difficulty = (typeof DIFFICULTIES)[number];
export type GameId = (typeof GAME_IDS)[number];
export type InputMode = (typeof INPUT_MODES)[number];
export type Effects = (typeof EFFECTS)[number];
export type ImageSize = (typeof IMAGE_SIZES)[number];

// ---- The full settings list (CONCEPT.md). Release 1 only shows some of them. ----
export interface Settings {
  language: Language;
  inputMode: InputMode; // 'both' = Drag and Tap-Tap work at the same time
  effects: Effects;
  imageSize: ImageSize;
  sound: boolean;
  hints: boolean;
  swipe: boolean;
  collection: string; // picture collection id
  level: Record<GameId, Difficulty>; // per game: the player's last chosen level (first play: easy)
}

// ---- How to add a setting: add it to Settings, then add one entry in SPECS. ----
interface Spec<T> {
  default: T;
  parse: (value: unknown) => T | undefined; // return undefined when the stored value is invalid
}

const oneOf =
  <T extends string>(list: readonly T[]) =>
  (value: unknown): T | undefined =>
    list.includes(value as T) ? (value as T) : undefined;

const bool = (value: unknown): boolean | undefined => (typeof value === 'boolean' ? value : undefined);

const nonEmptyString = (value: unknown): string | undefined =>
  typeof value === 'string' && value.length > 0 ? value : undefined;

const perGame =
  <T>(fallback: T, parse: (value: unknown) => T | undefined) =>
  (value: unknown): Record<GameId, T> | undefined => {
    if (typeof value !== 'object' || value === null) return undefined;
    const record = {} as Record<GameId, T>;
    for (const id of GAME_IDS) record[id] = parse((value as Record<string, unknown>)[id]) ?? fallback;
    return record;
  };

const perGameDefault = <T>(value: T): Record<GameId, T> => {
  const record = {} as Record<GameId, T>;
  for (const id of GAME_IDS) record[id] = value;
  return record;
};

const SPECS: { [K in keyof Settings]: Spec<Settings[K]> } = {
  language: { default: 'fr', parse: oneOf(LANGUAGES) },
  inputMode: { default: 'both', parse: oneOf(INPUT_MODES) },
  effects: { default: 'gentle', parse: oneOf(EFFECTS) },
  imageSize: { default: 'large', parse: oneOf(IMAGE_SIZES) },
  sound: { default: false, parse: bool },
  hints: { default: true, parse: bool },
  swipe: { default: true, parse: bool },
  collection: { default: 'nature', parse: nonEmptyString },
  level: { default: perGameDefault<Difficulty>('easy'), parse: perGame<Difficulty>('easy', oneOf(DIFFICULTIES)) },
};

const SETTING_KEYS = Object.keys(SPECS) as (keyof Settings)[];

export function defaultSettings(): Settings {
  const result: Record<string, unknown> = {};
  for (const key of SETTING_KEYS) {
    const value = SPECS[key].default;
    result[key] = Array.isArray(value) ? [...value] : typeof value === 'object' ? { ...value } : value;
  }
  return result as unknown as Settings;
}

function sanitize(raw: unknown): Settings {
  const result = defaultSettings() as unknown as Record<string, unknown>;
  if (typeof raw === 'object' && raw !== null) {
    for (const key of SETTING_KEYS) {
      const parsed = (SPECS[key].parse as (v: unknown) => unknown)((raw as Record<string, unknown>)[key]);
      if (parsed !== undefined) result[key] = parsed;
    }
  }
  return result as unknown as Settings;
}

// ---- Storage (never throws: the app must still work if storage fails) ----
const STORAGE_KEY = 'oasis.settings.v1';

function load(): Settings {
  try {
    const text = window.localStorage.getItem(STORAGE_KEY);
    return sanitize(text ? JSON.parse(text) : undefined);
  } catch {
    return defaultSettings();
  }
}

function save(settings: Settings): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Storage unavailable or full: keep working with in-memory settings.
  }
}

// ---- Store ----
let current: Settings = load();
const listeners = new Set<() => void>();

export function getSettings(): Settings {
  return current;
}

export function updateSettings(patch: Partial<Settings>): void {
  current = sanitize({ ...current, ...patch });
  save(current);
  listeners.forEach((listener) => listener());
}

// In-game level picker: the player's level, remembered per game for next time.
export function setLevel(game: GameId, level: Difficulty): void {
  updateSettings({ level: { ...current.level, [game]: level } });
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useSettings(): Settings {
  return useSyncExternalStore(subscribe, getSettings, getSettings);
}
