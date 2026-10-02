import type { CSSProperties } from 'react';
import { Trophy } from 'lucide-react';
import { Tile } from '../../kit/Tile';
import type { Picture } from '../../pictures/types';

// The Mahjong end-card decoration, built from the tiles of the board just played.
// Win: a gold trophy with 4 tiles fanned out on both sides. Stuck: 3 remaining tiles in front, 3 faded behind.
// Positions are the final ones; the CSS animations (styles.css, .end-deco-*) only add the entrance.
interface Placed {
  picture: Picture;
  dx: number; // rem from the centre
  rot: number; // deg
  dy?: number; // rem
}

function Piece({ picture, dx, rot, dy = 0, faded, order }: Placed & { faded?: boolean; order: number }) {
  const style = { '--dx': `${dx}rem`, '--dy': `${dy}rem`, '--rot': `${rot}deg`, '--order': order } as CSSProperties;
  return (
    <div className="end-deco-tile" data-faded={faded ? 'true' : undefined} style={style}>
      <Tile picture={picture} style={{ left: 0, top: 0, width: '4.6rem', height: '5.6rem', ['--tw' as string]: '4.6rem', ['--t' as string]: '0.45rem' }} />
    </div>
  );
}

export function WinDecoration({ pictures }: { pictures: Picture[] }) {
  const slots = [-12.5, -7.2, 7.2, 12.5];
  const rots = [-16, -7, 7, 16];
  const drop = [0.9, 0.2, 0.2, 0.9];
  return (
    <div className="end-deco-stage" data-kind="win">
      {pictures.slice(0, 4).map((picture, i) => (
        <Piece key={i} picture={picture} dx={slots[i]} rot={rots[i]} dy={drop[i]} order={i} />
      ))}
      <div className="end-trophy">
        <Trophy strokeWidth={1.8} fill="#f2b92f" stroke="#b9801a" aria-hidden="true" />
      </div>
    </div>
  );
}

export function StuckDecoration({ pictures }: { pictures: Picture[] }) {
  const back = [-8.5, -2.8, 2.8, 8.5];
  const front = [-6, 0, 6];
  const frontRot = [-5, 2, 6];
  return (
    <div className="end-deco-stage" data-kind="stuck">
      {pictures.slice(3, 7).map((picture, i) => (
        <Piece key={`b${i}`} picture={picture} dx={back[i]} rot={(i - 1.5) * 9} dy={-0.6} faded order={0} />
      ))}
      {pictures.slice(0, 3).map((picture, i) => (
        <Piece key={`f${i}`} picture={picture} dx={front[i]} rot={frontRot[i]} dy={0.5} order={1} />
      ))}
    </div>
  );
}
