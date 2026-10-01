import type { GameId } from './settings';

// What the Settings screen exposes in this release (CONCEPT.md, "Releases").
// The store supports every setting; adding one to a release is a one-line change here.
export type VisibleSetting = 'language' | 'difficulty' | 'sound';

export const RELEASE_VISIBLE_SETTINGS: readonly VisibleSetting[] = ['language', 'difficulty', 'sound'];

// Games that show a Difficulty control (Release 1: Mahjong only).
export const RELEASE_DIFFICULTY_GAMES: readonly GameId[] = ['mahjong'];
