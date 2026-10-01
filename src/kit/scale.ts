// Layout scaling. Design base: 1280x800 landscape (800x1280 portrait).
// The whole UI is sized in rem, and the root font size follows the screen, so
// everything scales smoothly on any tablet, in either orientation, without transforms.
const BASE_LONG = 1280;
const BASE_SHORT = 800;
const MIN_SCALE = 0.5;
const MAX_SCALE = 3;

let scale = 1;

export function getScale(): number {
  return scale;
}

export function computeScale(width: number, height: number): number {
  const landscape = width >= height;
  const baseW = landscape ? BASE_LONG : BASE_SHORT;
  const baseH = landscape ? BASE_SHORT : BASE_LONG;
  return Math.max(MIN_SCALE, Math.min(MAX_SCALE, Math.min(width / baseW, height / baseH)));
}

function apply(): void {
  scale = computeScale(window.innerWidth, window.innerHeight);
  const root = document.documentElement;
  root.style.fontSize = `${(16 * scale).toFixed(3)}px`;
  root.style.setProperty('--s', scale.toFixed(4));
}

export function installScale(): void {
  let frame = 0;
  const schedule = () => {
    window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(apply);
  };
  apply();
  window.addEventListener('resize', schedule);
  window.addEventListener('orientationchange', schedule);
}
