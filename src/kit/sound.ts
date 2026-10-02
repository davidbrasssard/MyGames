import { getSettings, type GameId } from '../settings/settings';

// Shared sound module. Sounds are synthesized with the Web Audio API (no audio files, works offline)
// and only play when the Home speaker is ON. Quiet, short, no music.
type Ctx = AudioContext;
const AudioCtor: typeof AudioContext | undefined =
  typeof window === 'undefined' ? undefined : window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

let ctx: Ctx | null = null;

function context(): Ctx | null {
  if (!AudioCtor) return null;
  if (!ctx) {
    try {
      ctx = new AudioCtor();
    } catch {
      return null;
    }
  }
  return ctx;
}

// iOS Safari and Chrome only allow audio after a user gesture: create/resume the context on the first tap.
export function installAudioUnlock(): void {
  const unlock = () => {
    const c = context();
    if (c && c.state !== 'running') {
      try {
        const p = c.resume();
        if (p && p.catch) p.catch(() => undefined);
      } catch {
        // Ignore: sound is optional.
      }
    }
  };
  ['pointerdown', 'touchend', 'click', 'keydown'].forEach((type) => window.addEventListener(type, unlock, { passive: true }));
}

// ---- Sounds (all synthesized, all quiet) ----
// Ivory tile "clack": a short filtered noise tick (the contact) plus two quickly dying tones (the woody/porcelain body),
// and a very faint second tick a few ms later, as two tiles touch.
function tileClick(c: Ctx): void {
  const t = c.currentTime;
  const master = c.createGain();
  master.gain.value = 0.5;
  master.connect(c.destination);

  const length = Math.floor(c.sampleRate * 0.05);
  const buffer = c.createBuffer(1, length, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;

  const tick = (at: number, level: number) => {
    const noise = c.createBufferSource();
    noise.buffer = buffer;
    const band = c.createBiquadFilter();
    band.type = 'bandpass';
    band.frequency.value = 2600;
    band.Q.value = 1.2;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.linearRampToValueAtTime(level, at + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0001, at + 0.03);
    noise.connect(band);
    band.connect(g);
    g.connect(master);
    noise.start(at);
    noise.stop(at + 0.05);
  };

  const tone = (freq: number, level: number, decay: number) => {
    const osc = c.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(level, t + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    osc.connect(g);
    g.connect(master);
    osc.start(t);
    osc.stop(t + decay + 0.02);
  };

  tick(t, 0.22);
  tick(t + 0.011, 0.1);
  tone(1250, 0.07, 0.07); // woody body
  tone(2050, 0.04, 0.045); // porcelain ring
}

// ---- Per-game choice ----
// Each game picks its own sound for a good action (a match, a piece placed...). Add a sound above,
// add its id here, then map the game to it.
const SOUNDS = { tileClick };
type SoundId = keyof typeof SOUNDS;

const GOOD_ACTION_SOUND: Record<GameId, SoundId> = {
  match: 'tileClick',
  mahjong: 'tileClick',
  tripletile: 'tileClick',
  match3: 'tileClick',
  puzzles: 'tileClick',
};

// Plays the game's good-action sound. Only when the Home speaker is ON.
export function playGood(game: GameId): void {
  if (!getSettings().sound) return;
  const c = context();
  if (!c || c.state !== 'running') return;
  try {
    SOUNDS[GOOD_ACTION_SOUND[game]](c);
  } catch {
    // Ignore: sound is optional.
  }
}
