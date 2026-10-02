import { useMemo } from 'react';
import { Celebration, pickCelebration, type CelebrationId } from '../../kit/Celebrations';
import { NearMiss } from '../../kit/NearMiss';
import { Tile } from '../../kit/Tile';
import type { Picture } from '../../pictures/types';

// The Mahjong end-card decoration, built from the tiles of the board just played.
// Win: a kit celebration (trophy + 4 tiles). Stuck: a kit near-miss (pair + blocker).
// The kit picks the celebration (random, never the same twice in a row); Mahjong only supplies its tiles.
export function WinDecoration({ pictures, celebration }: { pictures: Picture[]; celebration?: CelebrationId }) {
  const id = useMemo(() => celebration ?? pickCelebration(), [celebration]);
  const pieces = pictures.slice(0, 4).map((picture, i) => (
    <Tile key={i} picture={picture} style={{ left: 0, top: 0, width: '4.6rem', height: '5.6rem', ['--tw' as string]: '4.6rem', ['--t' as string]: '0.45rem' }} />
  ));
  return <Celebration id={id} pieces={pieces} />;
}

// Stuck: a kit "near miss" with a matching pair and a different tile between them, all from the remaining board.
export function StuckDecoration({ pair, blocker }: { pair: Picture; blocker: Picture }) {
  const tile = (picture: Picture) => (
    <Tile picture={picture} style={{ left: 0, top: 0, width: '4.6rem', height: '5.6rem', ['--tw' as string]: '4.6rem', ['--t' as string]: '0.45rem' }} />
  );
  return <NearMiss pair={[tile(pair), tile(pair)]} blocker={tile(blocker)} />;
}
