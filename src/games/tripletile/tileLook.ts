import type { CSSProperties } from 'react';
import { BLOCKED_GREY, flatSides, paletteVars, type TilePalette } from '../../kit/tileDepth';

// Triple Tile's palette (white face, blue depth) on the kit tile depth. Free tiles keep the same pure white face (and its
// light edge) on every layer; only the blue thickness/rim and the grey of blocked tiles get a few percent darker per layer
// below the top one (`shade` = number of layers below the top layer).
const PALETTE: TilePalette = {
  fixed: {
    '--bw': '2px',
    '--c-face': 'rgb(255, 255, 255)',
    '--c-edge': 'rgb(207, 227, 241)',
  },
  shaded: {
    ...flatSides([111, 168, 214]),
    '--c-rim': [66, 125, 178],
    ...BLOCKED_GREY,
  },
};

export function tileVars(shade: number): CSSProperties {
  return paletteVars(PALETTE, shade);
}
