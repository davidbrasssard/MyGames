import { registerSW } from 'virtual:pwa-register';

// App updates are applied only while Home is showing, never in the middle of a game. No pop-up.
let updateReady = false;
let onHome = true;
let applyUpdate: ((reload?: boolean) => Promise<void>) | null = null;

function maybeApply(): void {
  if (updateReady && onHome && applyUpdate) {
    updateReady = false;
    void applyUpdate(true); // activates the new version and reloads once
  }
}

export function installUpdates(): void {
  try {
    applyUpdate = registerSW({
      onNeedRefresh() {
        updateReady = true;
        maybeApply();
      },
    });
  } catch {
    // No service worker support: nothing to update.
  }
}

// Called by the app whenever the visible screen changes.
export function setHomeShowing(showing: boolean): void {
  onHome = showing;
  maybeApply();
}
