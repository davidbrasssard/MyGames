import { FACE_H, FACE_W, LIFT, ROW, THICK } from '../games/tripletile/geometry';
import { LEVELS } from '../games/tripletile/layouts';
import { TILE_UNITS, type Pos } from '../games/tripletile/rules';
import './DevTripleLayouts.css';

// DEVELOPMENT ONLY. Reached at /dev/triple-layouts; App.tsx only loads this file when import.meta.env.DEV is true,
// so it is not part of the production build. Draws every Triple Tile layout small, grouped by level.
const PITCH = 22; // px per tile step in the previews

function Preview({ positions }: { positions: readonly Pos[] }) {
  const lefts = positions.map((p) => p.x / TILE_UNITS);
  const tops = positions.map((p) => (p.y / TILE_UNITS) * ROW - p.z * LIFT);
  const minL = Math.min(...lefts);
  const minT = Math.min(...tops);
  const w = (Math.max(...lefts) + FACE_W - minL) * PITCH;
  const h = (Math.max(...tops) + FACE_H + THICK - minT) * PITCH;
  return (
    <div className="dtl-board" style={{ width: w, height: h }}>
      {positions.map((p, i) => (
        <div
          key={i}
          className="dtl-tile"
          data-z={p.z}
          style={{
            left: (lefts[i] - minL) * PITCH,
            top: (tops[i] - minT) * PITCH,
            width: FACE_W * PITCH,
            height: FACE_H * PITCH,
            zIndex: p.z * 1000 + Math.round(p.y / 2),
          }}
        />
      ))}
    </div>
  );
}

export default function DevTripleLayouts() {
  return (
    <div className="dtl" data-scrollable>
      <h1 className="dev-title">Triple Tile layouts: {Object.values(LEVELS).reduce((n, l) => n + l.layouts.length, 0)}</h1>
      <p className="dev-note">Écran de développement. Plus la teinte est foncée, plus la couche est haute. Chaque niveau a ses 8 formes.</p>
      {Object.values(LEVELS).map((level) => (
        <section key={level.id}>
          <h2 className="dtl-level">
            Niveau {level.number} · {level.id} · {level.tiles} tuiles (piles max {level.maxPile}, couches max {level.maxLayers})
          </h2>
          <div className="dtl-row">
            {level.layouts.map((layout) => (
              <div key={layout.id} className="dtl-card">
                <Preview positions={layout.positions} />
                <div className="dtl-name">
                  {layout.name.fr} / {layout.name.en}
                </div>
                <div className="dtl-count">
                  {layout.id}: {layout.positions.length} tuiles, {Math.max(...layout.positions.map((p) => p.z)) + 1} couches
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
