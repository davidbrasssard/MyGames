import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { getGame } from './games/registry';
import { ScreenHost } from './kit/ScreenHost';
import { applyEffects } from './kit/motion';
import { setHomeShowing } from './kit/updates';
import { ComingSoonScreen } from './screens/ComingSoonScreen';
import { HomeScreen } from './screens/HomeScreen';
import { useSettings, type GameId } from './settings/settings';

type Screen = { name: 'home' } | { name: 'game'; id: GameId };

const HOME: Screen = { name: 'home' };

// Development-only picture review screen at /dev/tiles. `import.meta.env.DEV` is a build-time constant,
// so in the production build this is `null` and the screen's code is not included at all.
const DevTiles = import.meta.env.DEV ? lazy(() => import('./dev/DevTiles')) : null;
const DevTripleTiles = import.meta.env.DEV ? lazy(() => import('./dev/DevTripleTiles')) : null;
const DevTripleLayouts = import.meta.env.DEV ? lazy(() => import('./dev/DevTripleLayouts')) : null;

// The playable game if the game has one; otherwise the temporary "coming soon" screen.
function GameRoute({ id, onBack }: { id: GameId; onBack: () => void }) {
  const { Screen: GameScreenComponent } = getGame(id);
  return GameScreenComponent ? <GameScreenComponent onBack={onBack} /> : <ComingSoonScreen gameId={id} onBack={onBack} />;
}

export function App() {
  const { language, effects } = useSettings();
  const [screen, setScreen] = useState<Screen>(HOME);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    applyEffects(effects);
  }, [effects]);

  // A downloaded update is applied only while Home is showing.
  useEffect(() => {
    setHomeShowing(screen.name === 'home');
  }, [screen.name]);

  // The tablet's Back button returns Home instead of leaving the app.
  useEffect(() => {
    const onPop = () => setScreen(HOME);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const open = useCallback((next: Screen) => {
    try {
      window.history.pushState({ oasis: true }, '');
    } catch {
      // History unavailable: navigation still works through app state.
    }
    setScreen(next);
  }, []);

  const goHome = useCallback(() => {
    if (window.history.state && window.history.state.oasis) window.history.back();
    else setScreen(HOME);
  }, []);

  if (DevTiles && window.location.pathname === '/dev/tiles') {
    return (
      <Suspense fallback={null}>
        <DevTiles />
      </Suspense>
    );
  }

  if (DevTripleTiles && window.location.pathname === '/dev/triple-tiles') {
    return (
      <Suspense fallback={null}>
        <DevTripleTiles />
      </Suspense>
    );
  }

  if (DevTripleLayouts && window.location.pathname === '/dev/triple-layouts') {
    return (
      <Suspense fallback={null}>
        <DevTripleLayouts />
      </Suspense>
    );
  }

  const key = screen.name === 'game' ? `game:${screen.id}` : screen.name;

  return (
    <div className="app">
      <ScreenHost screenKey={key}>
        {screen.name === 'home' && (
          <HomeScreen onOpenGame={(id) => open({ name: 'game', id })} />
        )}
        {screen.name === 'game' && <GameRoute id={screen.id} onBack={goHome} />}
      </ScreenHost>
    </div>
  );
}
