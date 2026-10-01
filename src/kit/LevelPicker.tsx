import { BackButton } from '../components/BackButton';
import { LEVEL_TEXT, useT } from '../i18n/dictionary';
import { DIFFICULTIES, type Difficulty } from '../settings/settings';
import { TapButton } from './TapButton';

// The "Choose your level" screen, shared by every game. The game supplies the detail line of each
// level (e.g. "24 tuiles"); the kit supplies the names, colours, stars and the current-level mark.
export interface LevelPickerProps {
  current: Difficulty;
  detail: (level: Difficulty) => string;
  onPick: (level: Difficulty) => void;
  onBack: () => void;
}

const CARD_COLORS: Record<Difficulty, [string, string]> = {
  easy: ['#5db56a', '#2f8a4a'],
  medium: ['#4aa3dc', '#2a6fb8'],
  hard: ['#9a78d6', '#6c48b0'],
  veryHard: ['#d9779a', '#b24570'],
};

function Star({ on }: { on: boolean }) {
  return (
    <svg className="lp-star" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4L2.8 9.5l6.4-.8z"
        fill={on ? '#ffd24d' : 'rgba(255,255,255,0.32)'}
        stroke={on ? '#e0a21c' : 'rgba(255,255,255,0.5)'}
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LevelPicker({ current, detail, onPick, onBack }: LevelPickerProps) {
  const t = useT();
  return (
    <div className="level-picker">
      <header className="level-picker-bar">
        <BackButton onBack={onBack} />
        <h1 className="level-picker-title">{t('chooseLevel')}</h1>
      </header>
      <div className="level-picker-cards" role="radiogroup" aria-label={t('chooseLevel')}>
        {DIFFICULTIES.map((level, index) => (
          <TapButton
            key={level}
            className="level-card"
            role="radio"
            aria-checked={level === current}
            data-current={level === current}
            style={{ backgroundImage: `linear-gradient(to bottom, ${CARD_COLORS[level][0]}, ${CARD_COLORS[level][1]})` }}
            onTap={() => onPick(level)}
          >
            <span className="lp-name">{t(LEVEL_TEXT[level])}</span>
            <span className="lp-detail">{detail(level)}</span>
            <span className="lp-stars">
              {DIFFICULTIES.map((_, i) => (
                <Star key={i} on={i <= index} />
              ))}
            </span>
            <span className="lp-current">{level === current ? `✓ ${t('levelCurrent')}` : ''}</span>
          </TapButton>
        ))}
      </div>
    </div>
  );
}
