import type { CSSProperties, ReactNode } from 'react';
import './Celebrations.css';

// Win celebrations, shared by every game. A celebration gets the game's pieces (already rendered, e.g. 4 Mahjong tiles,
// each about 4.6rem x 5.6rem) and draws them with the Fluent trophy inside a 9rem-high, full-width box (the EndCard decoration area).
// Final positions are plain CSS; the animations (Celebrations.css) only add the entrance, so Minimal = the static final layout.
// All of them use transform and opacity only, follow the Effects setting, and end in a calm resting pose.
export const CELEBRATIONS = ['pop', 'wave', 'orbit', 'rain', 'sunburst'] as const;
export type CelebrationId = (typeof CELEBRATIONS)[number];

const STORAGE_KEY = 'oasis.lastCelebration';

// A random celebration, never the same as the previous win on this device.
export function pickCelebration(): CelebrationId {
  let last: string | null = null;
  try {
    last = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    // storage unavailable: fine, only the repeat guard is lost
  }
  const choices = CELEBRATIONS.filter((id) => id !== last);
  const id = choices[Math.floor(Math.random() * choices.length)];
  try {
    window.localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // ignore
  }
  return id;
}

// Final slots, left to right: x in rem from the centre, tilt in degrees, drop in rem.
const FAN = { dx: [-12.5, -7.2, 7.2, 12.5], rot: [-16, -7, 7, 16], dy: [0.9, 0.2, 0.2, 0.9] };
const FLAT = { dx: FAN.dx, rot: [0, 0, 0, 0], dy: [0.5, 0.5, 0.5, 0.5] };

function Trophy() {
  return <img className="cel-trophy" src={`${import.meta.env.BASE_URL}kit/trophy.svg`} alt="" draggable={false} />;
}

function Sunrays() {
  const wedges: string[] = [];
  for (let i = 0; i < 12; i++) {
    const a = (i * 30 * Math.PI) / 180;
    const b = ((i * 30 + 14) * Math.PI) / 180;
    wedges.push(`M0 0L${(Math.cos(a) * 100).toFixed(1)} ${(Math.sin(a) * 100).toFixed(1)}L${(Math.cos(b) * 100).toFixed(1)} ${(Math.sin(b) * 100).toFixed(1)}Z`);
  }
  return (
    <svg className="cel-rays" viewBox="-100 -100 200 200" aria-hidden="true">
      <defs>
        <radialGradient id="cel-ray-fade" cx="0" cy="0" r="100" gradientUnits="userSpaceOnUse">
          <stop offset="0.1" stopColor="#f6c344" stopOpacity="0.75" />
          <stop offset="1" stopColor="#f6c344" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path d={wedges.join('')} fill="url(#cel-ray-fade)" />
    </svg>
  );
}

export function Celebration({ id, pieces }: { id: CelebrationId; pieces: ReactNode[] }) {
  const pos = id === 'pop' ? FAN : FLAT; // pop fans the tiles out; the others rest them upright at the sides
  return (
    <div className="cel" data-cel={id}>
      {id === 'sunburst' && <Sunrays />}
      {pieces.slice(0, 4).map((piece, i) => {
        const style = {
          '--dx': `${pos.dx[i]}rem`,
          '--dy': `${pos.dy[i]}rem`,
          '--rot': `${pos.rot[i]}deg`,
          '--sg': pos.dx[i] < 0 ? -1 : 1,
          '--order': i, // stagger: left to right
        } as CSSProperties;
        return (
          <div key={i} className="cel-tile" style={style}>
            {piece}
          </div>
        );
      })}
      <Trophy />
    </div>
  );
}
