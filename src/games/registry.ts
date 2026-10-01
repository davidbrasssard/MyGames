import type { ComponentType } from 'react';
import type { TextKey } from '../i18n/dictionary';
import type { GameId } from '../settings/settings';
import type { GameProps } from '../kit/GameScreen';
import { MahjongGame } from './mahjong/MahjongGame';
import { Match3Icon, MahjongIcon, MatchIcon, PuzzlesIcon } from './icons';

export interface GameDef {
  id: GameId;
  nameKey: TextKey;
  taglineKey: TextKey;
  colors: [string, string]; // button gradient, top to bottom
  Icon: ComponentType;
  Screen?: ComponentType<GameProps>; // the playable game; games without one show the "coming soon" screen
}

// Every game the app knows about. Home shows the ones that have a Screen (released).
// To add a game: add its id in settings.ts (GAME_IDS), its texts in the dictionary, and an entry here.
export const GAMES: GameDef[] = [
  { id: 'match', nameKey: 'gameMatch', taglineKey: 'gameMatchTagline', colors: ['#3d9be8', '#1f6fc4'], Icon: MatchIcon },
  { id: 'mahjong', nameKey: 'gameMahjong', taglineKey: 'gameMahjongTagline', colors: ['#47b565', '#2a8a47'], Icon: MahjongIcon, Screen: MahjongGame },
  { id: 'match3', nameKey: 'gameMatch3', taglineKey: 'gameMatch3Tagline', colors: ['#9a68dc', '#6b3fb8'], Icon: Match3Icon },
  { id: 'puzzles', nameKey: 'gamePuzzles', taglineKey: 'gamePuzzlesTagline', colors: ['#ec8226', '#c25a10'], Icon: PuzzlesIcon },
];

export function getGame(id: GameId): GameDef {
  return GAMES.find((game) => game.id === id) ?? GAMES[0];
}
