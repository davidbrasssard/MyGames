import { BackButton } from '../components/BackButton';
import { getGame } from '../games/registry';
import { useT } from '../i18n/dictionary';
import type { GameId } from '../settings/settings';

// Temporary development screen: replaced by the real game screen in the next step.
export function ComingSoonScreen({ gameId, onBack }: { gameId: GameId; onBack: () => void }) {
  const t = useT();
  const game = getGame(gameId);
  const { Icon } = game;
  return (
    <div className="coming-soon">
      <div className="panel coming-soon-card">
        <span className="coming-soon-icon">
          <Icon />
        </span>
        <h1 className="coming-soon-title">{t(game.nameKey)}</h1>
        <p className="coming-soon-text">{t('comingSoon')}</p>
        <BackButton onBack={onBack} large />
      </div>
    </div>
  );
}
