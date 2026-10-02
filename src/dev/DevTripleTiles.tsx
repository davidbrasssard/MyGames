import { TRIPLE_TILES_FLUENT } from '../pictures/tripleTilesFluent';
import './DevTripleTiles.css';

// DEVELOPMENT ONLY. Reached at /dev/triple-tiles; App.tsx only loads this file when import.meta.env.DEV is true,
// so it is not part of the production build. Shows each Triple Tile picture on a white tile, free and blocked.
export default function DevTripleTiles() {
  const { pictures, basePath } = TRIPLE_TILES_FLUENT;
  // pictureUrl() builds ".svg" paths for Mahjong; these pictures are PNG, so the URL is built here.
  const url = (id: string) => `${import.meta.env.BASE_URL}${basePath}/${id}.png`;
  return (
    <div className="dtt" data-scrollable>
      <h1 className="dev-title">triple-tiles-fluent: {pictures.length} images</h1>
      <p className="dev-note">Écran de développement. Chaque image est montrée libre (à gauche) et bloquée (à droite).</p>
      <div className="dtt-grid">
        {pictures.map((picture) => (
          <div key={picture.id}>
            <div className="dtt-pair">
              {[false, true].map((blocked) => (
                <figure key={String(blocked)} className="dtt-cell">
                  <div className="dtt-tile" data-blocked={blocked ? 'true' : undefined}>
                    <img src={url(picture.id)} alt={picture.name.fr} draggable={false} />
                  </div>
                  <figcaption className="dtt-label">{blocked ? 'bloquée' : 'libre'}</figcaption>
                </figure>
              ))}
            </div>
            <div className="dtt-name">{picture.name.fr}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
