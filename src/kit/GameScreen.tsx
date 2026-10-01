import type { ComponentType, ReactNode } from 'react';
import { BackButton } from '../components/BackButton';
import { useT, type TextKey } from '../i18n/dictionary';
import { HintIcon, ShuffleIcon, UndoIcon } from './actionIcons';
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

interface GameScreenProps {
  title: string;
  levelLabel: string;
  onBack: () => void;
  actions: GameAction[];
  caption?: string;
  children: ReactNode; // the board
}

export function GameScreen({ title, levelLabel, onBack, actions, caption, children }: GameScreenProps) {
  const t = useT();
  return (
    <div className="game-screen">
      <header className="game-topbar">
        <BackButton onBack={onBack} />
        <h1 className="game-title">{title}</h1>
        <span className="game-level">{levelLabel}</span>
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
    </div>
  );
}
