import type { CSSProperties } from 'react';
import './tileDepth.css';

// The kit tile depth: the one recipe every tile-type game uses, each with its own palette.
//  - Geometry: the face plus its side thickness (left and bottom) fill the grid step exactly, so neighbours touch with no gap.
//    Each layer sits up by the bottom thickness and right by the left thickness, so a higher tile covers the lower one's face
//    and only the thickness edges of the pile show.
//  - Colours: CSS variables set per tile. Lower layers get a few percent darker (`shade` = number of layers below the top).
//  - Looks (tileDepth.css): .td-solid (stepped thickness on left + bottom, rim, optional inset/ground extras),
//    .td-blocked (grey layer), .td-drop (light static ground shadow, no blur, no filter).

// ---- Geometry (all lengths in pitches, i.e. grid-step widths; multiply by the pitch in px) ----
export interface TileDepthSpec {
  thickL: number; // thickness visible on the left
  thickB: number; // thickness visible at the bottom
  faceH: number; // face height
}

export interface TileDepth extends TileDepthSpec {
  faceW: number; // face + left thickness = one pitch
  row: number; // vertical step between two rows: face + bottom thickness, no gap
  lift: number; // each layer sits this much higher...
  lean: number; // ...and this much further right
}

export function tileDepth(spec: TileDepthSpec): TileDepth {
  return { ...spec, faceW: 1 - spec.thickL, row: spec.faceH + spec.thickB, lift: spec.thickB, lean: spec.thickL };
}

// ---- Colours ----
type Rgb = [number, number, number];
// A palette: `fixed` colours are the same on every layer, `shaded` colours (rgb) darken per layer below the top.
// The depth CSS reads --c-edge, --c-rim, --c-side1..4 (the four stepped side faces) and --g-* (the blocked grey layer);
// a game adds its own face variables (--c-face, ...) and also sets --bw (border width) in `fixed`.
export interface TilePalette {
  fixed?: Record<string, string>;
  shaded: Record<string, Rgb>;
}

const SHADE_STEP = 0.04;

export function paletteVars(palette: TilePalette, shade: number): CSSProperties {
  const f = 1 - SHADE_STEP * shade;
  const vars: Record<string, string> = { ...palette.fixed };
  for (const [name, [r, g, b]] of Object.entries(palette.shaded)) {
    vars[name] = `rgb(${Math.round(r * f)}, ${Math.round(g * f)}, ${Math.round(b * f)})`;
  }
  return vars as CSSProperties;
}

// The grey of blocked tiles, shared by every game that shows blocked tiles.
export const BLOCKED_GREY: Record<string, Rgb> = {
  '--g-face': [201, 206, 212],
  '--g-edge': [170, 178, 186],
  '--g-side': [127, 147, 166],
  '--g-rim': [92, 110, 128],
};

// Four equal side steps (a flat side colour), for palettes that don't step their side colour.
export function flatSides(rgb: Rgb): Record<string, Rgb> {
  return { '--c-side1': rgb, '--c-side2': rgb, '--c-side3': rgb, '--c-side4': rgb };
}
