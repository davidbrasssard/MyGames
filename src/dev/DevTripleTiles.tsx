import { TRIPLE_TILES_FLUENT } from '../pictures/tripleTilesFluent';
import { tileVars } from '../games/tripletile/tileLook';
import '../games/tripletile/tripletile.css';
import './DevTripleTiles.css';

// DEVELOPMENT ONLY. Reached at /dev/triple-tiles; App.tsx only loads this file when import.meta.env.DEV is true,
// so it is not part of the production build. Shows each Triple Tile picture on a white tile, free and blocked.
// One tile drawn with the game's own CSS (same classes, same variables), so this page always shows the real look.
function DevTile({ src, alt, blocked, shade = 0, x = 0, y = 0 }: { src: string; alt: string; blocked?: boolean; shade?: number; x?: number; y?: number }) {
  return (
    <div className="tt-pos" style={{ ...tileVars(shade), width: '7rem', height: '7.8rem', transform: `translate(${x}rem, ${y}rem)`, zIndex: Math.round(-y * 10) }}>
      <div className="tt-drop" />
      <div className="tt-tile">
        <div className="tt-shade" style={{ opacity: blocked ? 1 : 0 }} />
        <img src={src} alt={alt} draggable={false} />
      </div>
    </div>
  );
}

export default function DevTripleTiles() {
  const { pictures, basePath } = TRIPLE_TILES_FLUENT;
  // pictureUrl() builds ".svg" paths for Mahjong; these pictures are PNG, so the URL is built here.
  const url = (id: string) => `${import.meta.env.BASE_URL}${basePath}/${id}.png`;
  return (
    <div className="dtt" data-scrollable>
      <h1 className="dev-title">triple-tiles-fluent: {pictures.length} images</h1>
      <p className="dev-note">Écran de développement. Chaque image est montrée libre (à gauche) et bloquée (à droite).</p>
      <h2 className="dtt-sub">Piles (3 couches, la plus basse un peu plus sombre) et rangée de plateau</h2>
      <div className="dtt-vars dtt-stack">
        {[0, 1, 2].map((z) => (
          <DevTile key={z} src={url(pictures[z].id)} alt="" shade={2 - z} x={1 + z * 0.8} y={2 - z * 0.84} />
        ))}
        <DevTile src={url(pictures[3].id)} alt="" x={8} y={2} />
        <DevTile src={url(pictures[4].id)} alt="" x={15.3} y={2} blocked />
        <DevTile src={url(pictures[5].id)} alt="" shade={1} x={15.3 + 0.8} y={2 - 0.84} />
      </div>
      <div className="dtt-grid">
        {pictures.map((picture) => (
          <div key={picture.id}>
            <div className="dtt-pair">
              {[false, true].map((blocked) => (
                <figure key={String(blocked)} className="dtt-cell">
                  <div className="dtt-vars dtt-slot">
                    <DevTile src={url(picture.id)} alt={picture.name.fr} blocked={blocked} />
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
