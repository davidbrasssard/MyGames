import { useSyncExternalStore } from 'react';

// Device quality tier, separate from the Effects setting. "lite" swaps the few costly visuals (blurred shadows and glows,
// many sparkles) for plain ones on slow tablets; "full" keeps the normal look. Applied as the class quality-lite on <html>.
//
// Detection never blocks the player: the tier is applied at once from what is remembered (or from browser hints), then an
// invisible ~2 s frame-rate probe runs on Home when nothing valid is remembered. The result is stored on the device and
// re-checked after 7 days or after an app update, so a new tablet moves to "full" by itself.
export type QualityTier = 'full' | 'lite';
export type QualitySource = 'override' | 'stored' | 'hint' | 'probe';

const STORAGE_KEY = 'oasis.quality';
const RECHECK_MS = 7 * 24 * 60 * 60 * 1000;
const PROBE_MS = 2000;
const WARMUP_FRAMES = 6;
const LONG_FRAME_MS = 40;
// Lite when the median frame is slower than this (ms), or when too many frames are long.
const MEDIAN_LITE_MS = 25;
const MEDIAN_LITE_HINTED_MS = 20; // stricter when the browser also says the device is small
const LONG_SHARE_LITE = 0.2;

interface Stored {
  tier: QualityTier;
  at: number;
  build: string;
}

let tier: QualityTier = 'full';
let source: QualitySource = 'hint';
let forced = false;
let probed = false;
const listeners = new Set<() => void>();

function setTier(next: QualityTier, from: QualitySource): void {
  tier = next;
  source = from;
  document.documentElement.classList.toggle('quality-lite', next === 'lite');
  listeners.forEach((listener) => listener());
}

// Small devices by the browser's own hints (both are missing on some browsers, then they say nothing).
function hintsSayLow(): boolean {
  const nav = navigator as Navigator & { deviceMemory?: number };
  return (typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 2) || (typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 4);
}

function readStored(): Stored | null {
  try {
    const data = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null');
    if (data && (data.tier === 'full' || data.tier === 'lite') && typeof data.at === 'number' && typeof data.build === 'string') return data;
  } catch {
    // Storage unavailable or damaged: treated as nothing remembered.
  }
  return null;
}

function store(value: QualityTier): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ tier: value, at: Date.now(), build: __BUILD_ID__ } satisfies Stored));
  } catch {
    // Not remembered: the probe simply runs again next time.
  }
}

function isFresh(saved: Stored | null): boolean {
  return saved !== null && saved.build === __BUILD_ID__ && Date.now() - saved.at < RECHECK_MS && Date.now() >= saved.at;
}

// Called once at startup, before the first render: no waiting.
export function installQuality(): void {
  if (import.meta.env.DEV) {
    const wanted = new URLSearchParams(window.location.search).get('quality');
    if (wanted === 'lite' || wanted === 'full') {
      forced = true;
      setTier(wanted, 'override');
      return;
    }
  }
  const saved = readStored();
  // Remembered tier (even a week-old one is used until the probe re-checks it); a new build starts again from the hints.
  if (saved && saved.build === __BUILD_ID__) setTier(saved.tier, 'stored');
  else setTier(hintsSayLow() ? 'lite' : 'full', 'hint');
}

// A tiny hidden animation (moving shapes with blurred shadows, like the costly effects) timed with requestAnimationFrame.
function runProbe(done: (median: number, longShare: number) => void, abort: () => void): void {
  const holder = document.createElement('div');
  holder.setAttribute('aria-hidden', 'true');
  holder.style.cssText = 'position:fixed;left:0;top:0;width:200px;height:120px;opacity:0.02;pointer-events:none;z-index:-1;overflow:hidden';
  const dots: HTMLElement[] = [];
  for (let i = 0; i < 12; i += 1) {
    const dot = document.createElement('div');
    dot.style.cssText = `position:absolute;left:${(i % 4) * 46}px;top:${Math.floor(i / 4) * 36}px;width:30px;height:24px;border-radius:6px;background:#888;box-shadow:0 0 14px 4px #000;will-change:transform`;
    holder.appendChild(dot);
    dots.push(dot);
  }
  document.body.appendChild(holder);

  const gaps: number[] = [];
  let last = 0;
  let start = 0;
  let aborted = false;
  const onHidden = () => {
    if (document.hidden) aborted = true;
  };
  document.addEventListener('visibilitychange', onHidden);

  const finish = () => {
    document.removeEventListener('visibilitychange', onHidden);
    holder.remove();
  };
  const frame = (now: number) => {
    if (aborted) {
      finish();
      abort();
      return;
    }
    if (last) gaps.push(now - last);
    else start = now;
    last = now;
    const phase = ((now - start) / 600) % 1;
    dots.forEach((dot, i) => {
      dot.style.transform = `translate(${Math.sin((phase + i / 12) * 6.283) * 8}px, ${Math.cos((phase + i / 12) * 6.283) * 6}px)`;
    });
    if (now - start < PROBE_MS) {
      requestAnimationFrame(frame);
      return;
    }
    finish();
    const used = gaps.slice(WARMUP_FRAMES);
    if (used.length < 10) return abort();
    const sorted = [...used].sort((a, b) => a - b);
    done(sorted[Math.floor(sorted.length / 2)], used.filter((gap) => gap > LONG_FRAME_MS).length / used.length);
  };
  requestAnimationFrame(frame);
}

function decide(median: number, longShare: number): QualityTier {
  const limit = hintsSayLow() ? MEDIAN_LITE_HINTED_MS : MEDIAN_LITE_MS;
  return median > limit || longShare > LONG_SHARE_LITE ? 'lite' : 'full';
}

export interface DeviceReport {
  tier: QualityTier;
  medianMs: number;
  longShare: number; // 0..1
  deviceMemory: number | undefined;
  hardwareConcurrency: number | undefined;
}

// DEVELOPMENT: runs the probe now (on any page), stores and applies the result like the normal probe. Null if the tab was hidden.
export function testDeviceNow(): Promise<DeviceReport | null> {
  return new Promise((resolve) => {
    runProbe(
      (median, longShare) => {
        const tierNow = decide(median, longShare);
        store(tierNow);
        if (!forced) setTier(tierNow, 'probe');
        const nav = navigator as Navigator & { deviceMemory?: number };
        resolve({ tier: tierNow, medianMs: median, longShare, deviceMemory: nav.deviceMemory, hardwareConcurrency: nav.hardwareConcurrency });
      },
      () => resolve(null),
    );
  });
}

// Called when Home shows. Runs the probe at most once per launch, and only when nothing valid is remembered.
export function startQualityProbe(): void {
  if (forced || probed || isFresh(readStored())) return;
  probed = true;
  window.setTimeout(() => {
    runProbe(
      (median, longShare) => {
        const result = decide(median, longShare);
        store(result);
        setTier(result, 'probe');
      },
      () => {
        probed = false; // tab hidden or too few frames: try again next time Home shows
      },
    );
  }, 1000);
}

// Silent safety net while a game screen is open: full -> lite only, never back. Frame gaps are collected in 5 s windows of
// active time; a window whose median is clearly slow switches to lite at once and is stored like the probe's result.
const WATCH_SETTLE_MS = 3000; // ignore the first seconds after a screen opens
const WATCH_WINDOW_MS = 5000;
const WATCH_MIN_FRAMES = 30;
const WATCH_MAX_GAP_MS = 500; // longer gaps are a pause or a suspended tab, not slow drawing
let watchId = 0;
let watchOn = false;
let watchHandler: (() => void) | null = null;

export function startGameWatch(): void {
  if (watchOn || forced || tier === 'lite') return;
  watchOn = true;
  const gaps: number[] = [];
  let last = 0;
  let begin = 0;
  let active = 0; // ms of active time in the current window
  const reset = () => {
    gaps.length = 0;
    last = 0;
    active = 0;
  };
  const onVisibility = () => {
    if (document.hidden) reset();
    begin = 0; // settle again after coming back
  };
  watchHandler = onVisibility;
  document.addEventListener('visibilitychange', onVisibility);
  const frame = (now: number) => {
    if (!watchOn) return;
    watchId = requestAnimationFrame(frame);
    if (document.hidden) return;
    if (!begin) begin = now;
    if (now - begin < WATCH_SETTLE_MS) {
      last = now;
      return;
    }
    if (last) {
      const gap = now - last;
      if (gap > WATCH_MAX_GAP_MS) {
        reset();
      } else {
        gaps.push(gap);
        active += gap;
      }
    }
    last = now;
    if (active < WATCH_WINDOW_MS) return;
    if (gaps.length >= WATCH_MIN_FRAMES) {
      gaps.sort((a, b) => a - b);
      if (gaps[gaps.length >> 1] > MEDIAN_LITE_MS) {
        store('lite');
        setTier('lite', 'probe');
        stopGameWatch();
        return;
      }
    }
    reset();
  };
  watchId = requestAnimationFrame(frame);
}

export function stopGameWatch(): void {
  if (!watchOn) return;
  watchOn = false;
  cancelAnimationFrame(watchId);
  if (watchHandler) document.removeEventListener('visibilitychange', watchHandler);
  watchHandler = null;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useQuality(): { tier: QualityTier; source: QualitySource } {
  const key = useSyncExternalStore(subscribe, () => `${tier}:${source}`);
  const [t, s] = key.split(':');
  return { tier: t as QualityTier, source: s as QualitySource };
}
