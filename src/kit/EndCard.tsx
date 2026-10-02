import type { ReactNode } from 'react';
import { useT } from '../i18n/dictionary';
import { OverlayCard } from './OverlayCard';
import { TapButton } from './TapButton';

// The end-of-game card, shared by every game: a warm ivory card with a gold border and a soft glow behind a decoration
// that the game supplies (e.g. a trophy and tiles). "win" = Bravo, "stuck" = the gentle Presque card (levels that can be lost).
// Tapping outside does not close it; only the two buttons do. Decoration animations live in the game's CSS and
// follow the Effects setting (see .end-deco rules in styles.css).
export interface EndCardProps {
  kind: 'win' | 'stuck';
  decoration?: ReactNode; // drawn in the top area, over the glow; should fit a 9rem-high, full-width box
  onReplay: () => void; // new board, same level
  onHome: () => void;
}

export function EndCard({ kind, decoration, onReplay, onHome }: EndCardProps) {
  const t = useT();
  const title = t(kind === 'win' ? 'endWin' : 'endStuck');
  return (
    <OverlayCard label={title} onClose={() => undefined} dismissable={false} className="end-overlay">
      {() => (
        <div className="end-card" data-kind={kind}>
          <div className="end-deco">
            <div className="end-glow" aria-hidden="true" />
            {decoration}
          </div>
          <h1 className="end-title">{title}</h1>
          <p className="end-line">{t(kind === 'win' ? 'endWinLine' : 'endStuckLine')}</p>
          <div className="end-buttons">
            <TapButton className="end-button end-button-main" onTap={onReplay}>
              {t('playAgain')}
            </TapButton>
            <TapButton className="end-button" onTap={onHome}>
              {t('home')}
            </TapButton>
          </div>
        </div>
      )}
    </OverlayCard>
  );
}
