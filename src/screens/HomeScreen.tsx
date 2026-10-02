import { useState } from 'react';
import { ChevronLeft, ChevronRight, Volume2, VolumeOff } from 'lucide-react';
import { LeafIcon } from '../games/icons';
import { GAMES, type GameDef } from '../games/registry';
import { useT } from '../i18n/dictionary';
import { TapButton } from '../kit/TapButton';
import { useTouch } from '../kit/touch';
import { updateSettings, useSettings, type GameId, type Language } from '../settings/settings';

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

export function HomeScreen({ onOpenGame }: { onOpenGame: (id: GameId) => void }) {
  const t = useT();
  const { swipe, language, sound } = useSettings();
  const [requestedPage, setPage] = useState(0);

  // Every released game (one with a playable screen) appears automatically.
  const games = GAMES.filter((game) => game.Screen);
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
        <div className="home-controls">
          <div className="lang-pill" role="radiogroup" aria-label={t('language')}>
            {(['fr', 'en'] as Language[]).map((code) => (
              <TapButton
                key={code}
                className="lang-option"
                role="radio"
                aria-checked={language === code}
                data-selected={language === code}
                onTap={() => updateSettings({ language: code })}
              >
                {code.toUpperCase()}
              </TapButton>
            ))}
          </div>
          <TapButton
            className="sound-button"
            role="switch"
            aria-checked={sound}
            aria-label={sound ? t('soundOn') : t('soundOff')}
            data-on={sound}
            onTap={() => updateSettings({ sound: !sound })}
          >
            {sound ? <Volume2 strokeWidth={2.5} aria-hidden="true" /> : <VolumeOff strokeWidth={2.5} aria-hidden="true" />}
          </TapButton>
        </div>
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
              <ChevronLeft strokeWidth={2.5} aria-hidden="true" />
            </TapButton>
            <TapButton
              className="page-arrow page-arrow-right"
              aria-label={t('nextPage')}
              disabled={page === pages.length - 1}
              onTap={() => goTo(page + 1)}
            >
              <ChevronRight strokeWidth={2.5} aria-hidden="true" />
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
