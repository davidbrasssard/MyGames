// Blocks browser gestures app-wide. CSS (touch-action, overscroll-behavior, user-select,
// -webkit-touch-callout) does most of the work; these listeners cover Safari and old WebViews.
export function installGestureBlockers(): void {
  const stop = (e: Event) => e.preventDefault();
  const options = { passive: false } as AddEventListenerOptions;

  // Pinch zoom (Safari gesture events) and multi-finger touches.
  document.addEventListener('gesturestart', stop, options);
  document.addEventListener('gesturechange', stop, options);
  document.addEventListener('gestureend', stop, options);
  document.addEventListener(
    'touchstart',
    (e) => {
      if (e.touches.length > 1) e.preventDefault();
    },
    options,
  );
  // Pull-to-refresh, overscroll bounce and scrolling: the app never scrolls.
  // Only an element marked data-scrollable (the development-only picture review) may scroll.
  document.addEventListener(
    'touchmove',
    (e) => {
      if (e.target instanceof Element && e.target.closest('[data-scrollable]')) return;
      e.preventDefault();
    },
    options,
  );

  // Double-tap zoom, long-press menu, text selection, image dragging.
  document.addEventListener('dblclick', stop, options);
  document.addEventListener('contextmenu', stop, options);
  document.addEventListener('selectstart', stop, options);
  document.addEventListener('dragstart', stop, options);
  document.addEventListener('wheel', (e) => {
    if (e.ctrlKey) e.preventDefault(); // trackpad / ctrl+wheel zoom
  }, options);
}

// Shows a focus ring only for keyboard users, never after a touch.
export function installFocusRing(): void {
  const root = document.documentElement;
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') root.classList.add('using-keyboard');
  });
  document.addEventListener('pointerdown', () => root.classList.remove('using-keyboard'), true);
}
