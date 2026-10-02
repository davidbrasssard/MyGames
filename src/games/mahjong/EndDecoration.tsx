import type { CSSProperties } from 'react';
import { useMemo } from 'react';
import { Celebration, pickCelebration, type CelebrationId } from '../../kit/Celebrations';
import { Tile } from '../../kit/Tile';
import type { Picture } from '../../pictures/types';

// The Mahjong end-card decoration, built from the tiles of the board just played.
// Win: a kit celebration (trophy + 4 tiles). Stuck: 3 remaining tiles in front, 3 faded behind.
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

// The kit picks the celebration (random, never the same twice in a row); Mahjong only supplies its tiles.
export function WinDecoration({ pictures, celebration }: { pictures: Picture[]; celebration?: CelebrationId }) {
  const id = useMemo(() => celebration ?? pickCelebration(), [celebration]);
  const pieces = pictures.slice(0, 4).map((picture, i) => (
    <Tile key={i} picture={picture} style={{ left: 0, top: 0, width: '4.6rem', height: '5.6rem', ['--tw' as string]: '4.6rem', ['--t' as string]: '0.45rem' }} />
  ));
  return <Celebration id={id} pieces={pieces} />;
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
