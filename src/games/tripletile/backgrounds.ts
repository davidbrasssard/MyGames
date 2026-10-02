// Photo backgrounds of Triple Tile (public/backgrounds, made by scripts/make-backgrounds.mjs; precached for offline).
// Each new board takes the background that was preloaded for it, never the same as the previous one,
// then the one after is picked and preloaded so the next switch is instant. Same in lite quality (images are cheap).
const NAMES = ['lake', 'balloons', 'river-sunset', 'cloud-lake', 'sky-sunset', 'green-hills'];
const url = (name: string) => `${import.meta.env.BASE_URL}backgrounds/${name}.jpg`;

let current: string | null = null;
let next: string | null = null;
const kept: HTMLImageElement[] = []; // keeps preloaded images alive in memory

function pickOtherThan(avoid: string | null): string {
  const choices = NAMES.filter((name) => name !== avoid);
  return choices[Math.floor(Math.random() * choices.length)];
}

function preload(name: string): void {
  const image = new Image();
  image.src = url(name);
  kept.push(image);
  if (kept.length > 2) kept.shift();
}

// The background URL for a new board.
export function takeBackground(): string {
  current = next && next !== current ? next : pickOtherThan(current);
  next = pickOtherThan(current);
  preload(next);
  return url(current);
}
