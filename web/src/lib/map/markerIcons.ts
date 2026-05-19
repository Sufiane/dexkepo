import L from 'leaflet';
import { spriteUrl } from '../utils/pokemonSprite';

type MarkerOptions = {
  pokemonNames: string[];
  visited: boolean;
};

/**
 * Marker = circular crop of the first Pokemon's Showdown sprite, framed by
 * a colored ring that signals visited state.
 * If the cover features 2+ Pokemon, a "+N" badge sits in the bottom-right.
 */
export function buildMarkerIcon(options: MarkerOptions): L.DivIcon {
  const [first] = options.pokemonNames;
  const extra = options.pokemonNames.length - 1;
  const ringClass = options.visited ? 'dx-ring-visited' : 'dx-ring-unvisited';
  const spriteSrc = first ? spriteUrl(first) : '';
  const spriteAlt = first ?? 'manhole';

  const badge = extra > 0 ? `<span class="dx-badge">+${extra}</span>` : '';

  return L.divIcon({
    className: '',
    html: `
      <div class="dx-marker ${ringClass}">
        <img class="dx-sprite" src="${spriteSrc}" alt="${spriteAlt}" loading="lazy" />
        ${badge}
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
}

export function clusterIcon(kind: 'visited' | 'unvisited') {
  return (cluster: L.MarkerCluster): L.DivIcon => {
    const count = cluster.getChildCount();
    const size = count < 10 ? 36 : count < 100 ? 44 : 54;

    return L.divIcon({
      html: `<div class="dx-cluster ${kind}" style="width:${size}px;height:${size}px;">${count}</div>`,
      className: '',
      iconSize: [size, size],
    });
  };
}
