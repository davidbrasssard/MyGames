import { pictureUrl } from '../pictures';
import { TILES_FLUENT } from '../pictures/tilesFluent';
import './DevTiles.css';

// DEVELOPMENT ONLY. Reached at /dev/tiles; App.tsx only loads this file when import.meta.env.DEV is true,
// so it is not part of the production build. Lets the pictures be reviewed on ivory tile mock-ups.
export default function DevTiles() {
  const { pictures } = TILES_FLUENT;
  return (
    <div className="dev-tiles" data-scrollable>
      <h1 className="dev-title">tiles-fluent: {pictures.length} images</h1>
      <p className="dev-note">Écran de développement. Chaque image est affichée sur une tuile ivoire avec son nom français.</p>
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
