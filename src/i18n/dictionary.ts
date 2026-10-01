import { useCallback } from 'react';
import { useSettings, type Difficulty, type Language } from '../settings/settings';

// Every visible text lives here. French is the source of truth for the keys.
const fr = {
  appName: 'Oasis',
  tagline: 'Jouer, se détendre, sourire',

  back: 'Retour',
  settings: 'Réglages',
  settingsHold: 'Réglages (maintenir appuyé 3 secondes)',
  previousPage: 'Page précédente',
  nextPage: 'Page suivante',

  gameMatch: 'Paires',
  gameMatchTagline: 'Trouvez les paires',
  gameMahjong: 'Mahjong',
  gameMahjongTagline: 'Videz le plateau',
  gameMatch3: 'Match 3',
  gameMatch3Tagline: 'Alignez les pièces',
  gamePuzzles: 'Puzzles',
  gamePuzzlesTagline: "Reconstituez l'image",

  comingSoon: 'Ce jeu arrive bientôt.',

  language: 'Langue',
  langFr: 'Français',
  langEn: 'English',
  difficulty: 'Difficulté',
  levelEasy: 'Facile',
  levelMedium: 'Moyen',
  levelHard: 'Difficile',
  levelVeryHard: 'Très difficile',
  sound: 'Son',
  on: 'Activé',
  off: 'Désactivé',

  level: 'Niveau',
  actionHint: 'Indice',
  actionUndo: 'Annuler',
  actionShuffle: 'Mélanger',
  mahjongCaption: 'Trouvez et retirez les tuiles identiques.',
};

export type TextKey = keyof typeof fr;

const en: Record<TextKey, string> = {
  appName: 'Oasis',
  tagline: 'Play, relax, smile',

  back: 'Back',
  settings: 'Settings',
  settingsHold: 'Settings (press and hold for 3 seconds)',
  previousPage: 'Previous page',
  nextPage: 'Next page',

  gameMatch: 'Match',
  gameMatchTagline: 'Find the pairs',
  gameMahjong: 'Mahjong',
  gameMahjongTagline: 'Clear the board',
  gameMatch3: 'Match 3',
  gameMatch3Tagline: 'Line up the pieces',
  gamePuzzles: 'Puzzles',
  gamePuzzlesTagline: 'Put the picture together',

  comingSoon: 'This game is coming soon.',

  language: 'Language',
  langFr: 'Français',
  langEn: 'English',
  difficulty: 'Difficulty',
  levelEasy: 'Easy',
  levelMedium: 'Medium',
  levelHard: 'Hard',
  levelVeryHard: 'Very hard',
  sound: 'Sound',
  on: 'On',
  off: 'Off',

  level: 'Level',
  actionHint: 'Hint',
  actionUndo: 'Undo',
  actionShuffle: 'Shuffle',
  mahjongCaption: 'Find and remove matching tiles.',
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
