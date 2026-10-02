import { useCallback } from 'react';
import { useSettings, type Difficulty, type Language } from '../settings/settings';

// Every visible text lives here. French is the source of truth for the keys.
const fr = {
  appName: 'Oasis',
  tagline: 'Jouer, se détendre, sourire',

  back: 'Retour',
  settingsHold: 'Réglages (maintenir appuyé 3 secondes)',
  previousPage: 'Page précédente',
  nextPage: 'Page suivante',

  gameMatch: 'Paires',
  gameMatchTagline: 'Trouvez les paires',
  gameMahjong: 'Mahjong',
  gameMahjongTagline: 'Videz le plateau',
  gameTripleTile: 'Trio',
  gameTripleTileTagline: 'Réunissez trois images',
  gameMatch3: 'Match 3',
  gameMatch3Tagline: 'Alignez les pièces',
  gamePuzzles: 'Puzzles',
  gamePuzzlesTagline: "Reconstituez l'image",

  comingSoon: 'Ce jeu arrive bientôt.',

  language: 'Langue',
  chooseLevel: 'Choisir le niveau',
  levelCurrent: 'Niveau actuel',
  changeLevel: 'Changer de niveau',
  tilesCount: '{n} tuiles',
  trayFull: 'Plateau plein — annulez votre dernier coup',
  levelEasy: 'Facile',
  levelMedium: 'Moyen',
  levelHard: 'Difficile',
  levelVeryHard: 'Très difficile',
  soundOn: 'Son activé',
  soundOff: 'Son désactivé',

  level: 'Niveau',
  actionHint: 'Indice',
  actionUndo: 'Annuler',
  actionShuffle: 'Mélanger',
  mahjongCaption: 'Trouvez et retirez les tuiles identiques.',

  kindRelaxed: 'Détente',
  kindChallenge: 'Défi',
  endWin: 'Bravo !',
  endStuck: 'Presque !',
  endWinLine: 'Partie terminée',
  endStuckLine: 'On réessaie ?',
  endStuckNot: 'Pas cette fois…',
  endStuckClose: 'Oh, si près !',
  playAgain: 'Rejouer',
  home: 'Accueil',
};

export type TextKey = keyof typeof fr;

const en: Record<TextKey, string> = {
  appName: 'Oasis',
  tagline: 'Play, relax, smile',

  back: 'Back',
  settingsHold: 'Settings (press and hold for 3 seconds)',
  previousPage: 'Previous page',
  nextPage: 'Next page',

  gameMatch: 'Match',
  gameMatchTagline: 'Find the pairs',
  gameMahjong: 'Mahjong',
  gameMahjongTagline: 'Clear the board',
  gameTripleTile: 'Triple Tile',
  gameTripleTileTagline: 'Match three pictures',
  gameMatch3: 'Match 3',
  gameMatch3Tagline: 'Line up the pieces',
  gamePuzzles: 'Puzzles',
  gamePuzzlesTagline: 'Put the picture together',

  comingSoon: 'This game is coming soon.',

  language: 'Language',
  chooseLevel: 'Choose your level',
  levelCurrent: 'Current level',
  changeLevel: 'Change level',
  tilesCount: '{n} tiles',
  trayFull: 'Tray full — undo your last move',
  levelEasy: 'Easy',
  levelMedium: 'Medium',
  levelHard: 'Hard',
  levelVeryHard: 'Very hard',
  soundOn: 'Sound on',
  soundOff: 'Sound off',

  level: 'Level',
  actionHint: 'Hint',
  actionUndo: 'Undo',
  actionShuffle: 'Shuffle',
  mahjongCaption: 'Find and remove matching tiles.',

  kindRelaxed: 'Relaxed',
  kindChallenge: 'Challenge',
  endWin: 'Well done!',
  endStuck: 'Almost!',
  endWinLine: 'Game complete',
  endStuckLine: 'Try again?',
  endStuckNot: 'Not this time…',
  endStuckClose: 'Oh, so close!',
  playAgain: 'Play again',
  home: 'Home',
};

export const DICTIONARY: Record<Language, Record<TextKey, string>> = { fr, en };

// Level names shared by every game (CONCEPT.md: Easy / Medium / Hard / Very Hard).
export const LEVEL_TEXT: Record<Difficulty, TextKey> = {
  easy: 'levelEasy',
  medium: 'levelMedium',
  hard: 'levelHard',
  veryHard: 'levelVeryHard',
};

export type Translate = (key: TextKey) => string;

export function useT(): Translate {
  const { language } = useSettings();
  return useCallback((key: TextKey) => DICTIONARY[language][key], [language]);
}
