import { useState, type ComponentType, type ReactNode } from 'react';
import { BackButton } from '../components/BackButton';
import { useT, type TextKey } from '../i18n/dictionary';
import { ChevronIcon } from '../games/icons';
import { HintIcon, ShuffleIcon, UndoIcon } from './actionIcons';
import type { Difficulty } from '../settings/settings';
import { LevelPicker } from './LevelPicker';
import { TapButton } from './TapButton';

// The one game screen layout, shared by every game:
// top bar (large Back, game name, level), the board in the middle, a side bar of large action buttons.
// A game declares which action buttons it uses by passing them in `actions`.
export type ActionId = 'hint' | 'undo' | 'shuffle';

export interface GameAction {
  id: ActionId;
  onTap: () => void;
  disabled?: boolean;
}

const ACTIONS: Record<ActionId, { labelKey: TextKey; Icon: ComponentType }> = {
  hint: { labelKey: 'actionHint', Icon: HintIcon },
  undo: { labelKey: 'actionUndo', Icon: UndoIcon },
  shuffle: { labelKey: 'actionShuffle', Icon: ShuffleIcon },
};

// What the app gives every game screen.
export interface GameProps {
  onBack: () => void; // back to Home
  onComplete: () => void; // the board is cleared
}

// The level badge is a button that opens the LevelPicker over the game (the game stays as it is).
export interface GameLevel {
  current: Difficulty;
  detail: (level: Difficulty) => string; // short line under each level name, e.g. "24 tuiles"
  onPick: (level: Difficulty) => void; // start a new board at that level
}

interface GameScreenProps {
  title: string;
  levelLabel: string;
  level: GameLevel;
  onBack: () => void;
  actions: GameAction[];
  caption?: string;
  children: ReactNode; // the board
}

export function GameScreen({ title, levelLabel, level, onBack, actions, caption, children }: GameScreenProps) {
  const t = useT();
  const [picking, setPicking] = useState(false);
  return (
    <div className="game-screen">
      <header className="game-topbar">
        <BackButton onBack={onBack} />
        <h1 className="game-title">{title}</h1>
        <TapButton className="game-level" aria-label={`${t('changeLevel')}: ${levelLabel}`} onTap={() => setPicking(true)}>
          <span>{levelLabel}</span>
          <ChevronIcon direction="down" />
        </TapButton>
      </header>

      <div className="game-body">
        <div className="game-main">
          <div className="game-board-area">{children}</div>
          {caption && <p className="game-caption">{caption}</p>}
        </div>

        {actions.length > 0 && (
          <aside className="game-sidebar">
            {actions.map((action) => {
              const { labelKey, Icon } = ACTIONS[action.id];
              return (
                <TapButton key={action.id} className="action-button" disabled={action.disabled} onTap={action.onTap}>
                  <Icon />
                  <span>{t(labelKey)}</span>
                </TapButton>
              );
            })}
          </aside>
        )}
      </div>
    
      {picking && (
        <LevelPicker
          current={level.current}
          detail={level.detail}
          onBack={() => setPicking(false)}
          onPick={(next) => {
            setPicking(false);
            level.onPick(next);
          }}
        />
      )}
    </div>
  );
}
