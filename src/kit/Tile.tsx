import type { CSSProperties, Ref } from 'react';
import { pictureName, pictureUrl } from '../pictures';
import { TILES_FLUENT } from '../pictures/tilesFluent';
import type { Picture, PictureCollection } from '../pictures/types';
import { useSettings } from '../settings/settings';
import { paletteVars, type TilePalette } from './tileDepth';
import './Tile.css';

// The one tile look used by every game: an ivory block with the kit tile depth (visible thickness left and bottom), rounded edges and a
// soft static shadow, with a picture on top. Sized from the --tw CSS variable (the tile width in px)
// and --t (the side thickness in px), set by the board that holds it (the left thickness --tl equals --t).
//   normal   : plain
//   selected : gently lifted with a soft glow
//   blocked  : looks exactly like normal (tiles are never greyed out)
//   removed  : glides away and fades (length follows the Effects setting)
export type TileState = 'normal' | 'selected' | 'blocked' | 'removed';

// Mahjong's palette (ivory with gold-tan sides) on the kit tile depth. Lower layers are a few percent darker than the top one.
// Here the faces darken too (a Mahjong look); Triple Tile keeps its free faces fixed.
const PALETTE: TilePalette = {
  fixed: { '--bw': 'calc(var(--tw) * 0.022)' },
  shaded: {
    '--c-face1': [255, 253, 245],
    '--c-face2': [248, 240, 220],
    '--c-face3': [236, 223, 192],
    '--c-side1': [230, 214, 173],
    '--c-side2': [217, 196, 150],
    '--c-side3': [200, 173, 121],
    '--c-side4': [180, 149, 92],
    '--c-edge': [176, 144, 90],
    '--c-rim': [138, 108, 60],
  },
};

export interface TileProps {
  picture: Picture;
  collection?: PictureCollection;
  state?: TileState;
  hint?: boolean; // soft glow that suggests this tile
  returning?: boolean; // fades back in (after an undo)
  tileId?: number;
  shade?: number; // 0 = top layer, 1 = one layer lower... (slightly darker each step)
  style?: CSSProperties;
  ref?: Ref<HTMLDivElement>;
}

export function Tile({ picture, collection = TILES_FLUENT, state = 'normal', hint, returning, tileId, shade = 0, style, ref }: TileProps) {
  const { language } = useSettings();
  return (
    <div
      ref={ref}
      className="tile td-solid"
      data-state={state}
      data-hint={hint ? 'true' : undefined}
      data-returning={returning ? 'true' : undefined}
      data-tile-id={tileId}
      style={{ ...paletteVars(PALETTE, shade), ...style }}
    >
      <img src={pictureUrl(collection, picture)} alt={pictureName(picture, language)} draggable={false} />
    </div>
  );
}
