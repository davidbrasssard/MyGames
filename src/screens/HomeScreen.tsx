import { useState } from 'react';
import { GearButton } from '../components/GearButton';
import { ChevronIcon, LeafIcon } from '../games/icons';
import { GAMES, type GameDef } from '../games/registry';
import { useT } from '../i18n/dictionary';
import { TapButton } from '../kit/TapButton';
import { useTouch } from '../kit/touch';
import { useSettings, type GameId } from '../settings/settings';

const PAGE_SIZE = 4;

function chunk<T>(items: T[], size: number): T[][] {
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += size) pages.push(items.slice(i, i + size));
  return pages;
}

function GameButton({ game, onOpen }: { game: GameDef; onOpen: (id: GameId) => void }) {
  const t = useT();
  const { Icon } = game;
  return (
    <TapButton
      className="game-button"
      style={{ backgroundImage: `linear-gradient(to bottom, ${game.colors[0]}, ${game.colors[1]})` }}
      onTap={() => onOpen(game.id)}
    >
      <span className="game-icon">
        <Icon />
      </span>
      <span className="game-name">{t(game.nameKey)}</span>
      <span className="game-tagline">{t(game.taglineKey)}</span>
    </TapButton>
  );
}

export function HomeScreen({ onOpenGame, onOpenSettings }: { onOpenGame: (id: GameId) => void; onOpenSettings: () => void }) {
  const t = useT();
  const { enabledGames, swipe } = useSettings();
  const [requestedPage, setPage] = useState(0);

  // Only games switched on by the caregiver appear (no placeholders).
  const games = GAMES.filter((game) => enabledGames.includes(game.id));
  const pages = chunk(games, PAGE_SIZE);
  const paged = pages.length > 1;
  const page = Math.min(requestedPage, Math.max(0, pages.length - 1));

  const goTo = (index: number) => setPage(Math.max(0, Math.min(pages.length - 1, index)));
  const { handlers: swipeHandlers } = useTouch({
    onSwipe: swipe && paged ? (direction) => goTo(page + (direction === 'left' ? 1 : -1)) : undefined,
  });

  return (
    <div className="home">
      <header className="home-header">
        <div className="home-brand">
          <span className="home-leaf">
            <LeafIcon />
          </span>
          <div>
            <h1 className="home-title">{t('appName')}</h1>
            <p className="home-tagline">{t('tagline')}</p>
          </div>
        </div>
        <GearButton onOpen={onOpenSettings} />
      </header>

      <main className="home-stage" data-paged={paged} {...swipeHandlers}>
        <div className="home-pages" style={{ transform: `translateX(${-page * 100}%)` }}>
          {pages.map((pageGames, index) => (
            <div key={index} className="home-page" data-current={index === page} aria-hidden={index !== page}>
              <div className="game-grid" data-count={pageGames.length}>
                {pageGames.map((game) => (
                  <GameButton key={game.id} game={game} onOpen={onOpenGame} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {paged && (
          <>
            <TapButton className="page-arrow page-arrow-left" aria-label={t('previousPage')} disabled={page === 0} onTap={() => goTo(page - 1)}>
              <ChevronIcon direction="left" />
            </TapButton>
            <TapButton
              className="page-arrow page-arrow-right"
              aria-label={t('nextPage')}
              disabled={page === pages.length - 1}
              onTap={() => goTo(page + 1)}
            >
              <ChevronIcon direction="right" />
            </TapButton>
          </>
        )}
      </main>

      {paged && (
        <div className="page-dots" aria-hidden="true">
          {pages.map((_, index) => (
            <span key={index} className="page-dot" data-current={index === page} />
          ))}
        </div>
      )}
    </div>
  );
}
