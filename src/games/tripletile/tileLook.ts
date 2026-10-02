import type { CSSProperties } from 'react';

// Triple Tile tile colours. Free tiles keep the same pure white face (and its light edge) on every layer; only the blue
// thickness/rim and the grey of blocked tiles get a few percent darker per layer below the top one
// (`shade` = number of layers below the top layer). Computed here so the CSS stays simple on old browsers.
// --c-* colour the tile; --g-* colour its grey "blocked" layer.
const SHADE_STEP = 0.04;
const FIXED: Record<string, string> = {
  '--c-face': 'rgb(255, 255, 255)',
  '--c-edge': 'rgb(207, 227, 241)',
};
const BASE: Record<string, [number, number, number]> = {
  '--c-side': [111, 168, 214],
  '--c-rim': [66, 125, 178],
  '--g-face': [201, 206, 212],
  '--g-edge': [170, 178, 186],
  '--g-side': [127, 147, 166],
  '--g-rim': [92, 110, 128],
};

export function tileVars(shade: number): CSSProperties {
  const f = 1 - SHADE_STEP * shade;
  const vars: Record<string, string> = { ...FIXED };
  for (const [name, [r, g, b]] of Object.entries(BASE)) {
    vars[name] = `rgb(${Math.round(r * f)}, ${Math.round(g * f)}, ${Math.round(b * f)})`;
  }
  return vars as CSSProperties;
}
