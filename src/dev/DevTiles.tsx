import { useState } from 'react';
import { CELEBRATIONS, type CelebrationId } from '../kit/Celebrations';
import { StuckDecoration, WinDecoration } from '../games/mahjong/EndDecoration';
import { pictureUrl } from '../pictures';
import { TILES_FLUENT } from '../pictures/tilesFluent';
import './DevTiles.css';

// DEVELOPMENT ONLY. Reached at /dev/tiles; App.tsx only loads this file when import.meta.env.DEV is true,
// so it is not part of the production build. Lets the pictures be reviewed on ivory tile mock-ups.
export default function DevTiles() {
  const { pictures } = TILES_FLUENT;
  const [cel, setCel] = useState<{ id: CelebrationId; run: number } | null>(null);
  const [nearMiss, setNearMiss] = useState(0);
  const sample = [pictures[0], pictures[7], pictures[14], pictures[21]];
  return (
    <div className="dev-tiles" data-scrollable>
      <h1 className="dev-title">tiles-fluent: {pictures.length} images</h1>
      <p className="dev-note">Écran de développement. Chaque image est affichée sur une tuile ivoire avec son nom français.</p>
      <div className="dev-cel-buttons">
        {CELEBRATIONS.map((id) => (
          <button key={id} type="button" className="dev-cel-button" onClick={() => setCel((c) => ({ id, run: (c?.run ?? 0) + 1 }))}>
            {id}
          </button>
        ))}
      </div>
      <div className="dev-cel-buttons">
        <button type="button" className="dev-cel-button" onClick={() => setNearMiss((n) => n + 1)}>
          near miss
        </button>
      </div>
      <div className="dev-cel-stage">
        <div className="end-deco">{nearMiss > 0 && <StuckDecoration key={nearMiss} pair={pictures[0]} blocker={pictures[28]} />}</div>
      </div>
      <div className="dev-cel-stage">
        <div className="end-deco">
          <div className="end-glow" aria-hidden="true" />
          {cel && <WinDecoration key={cel.run} pictures={sample} celebration={cel.id} />}
        </div>
      </div>
      <div className="dev-grid">
        {pictures.map((picture, index) => (
          <figure key={picture.id} className="dev-cell">
            <div className="dev-tile">
              <span className="dev-number">{index + 1}</span>
              <img src={pictureUrl(TILES_FLUENT, picture)} alt={picture.name.fr} draggable={false} />
            </div>
            <figcaption className="dev-name">{picture.name.fr}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
