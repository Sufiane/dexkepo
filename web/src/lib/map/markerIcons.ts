import L from 'leaflet';
import { spriteUrl } from '../utils/pokemonSprite';

type MarkerOptions = {
  pokemonNames: string[];
  visited: boolean;
  hasLegendary?: boolean;
  hasMythical?: boolean;
  justToggled?: boolean;
};

/**
 * Marker = circular crop of the first Pokemon's Showdown sprite, framed by
 * a colored ring that signals visited state.
 *
 * Rarity overlay (mythical first, then legendary) replaces the visited/
 * unvisited tint to telegraph rare covers from a distance — visited state is
 * still readable via the inner-area saturation of the sprite.
 *
 * If the cover features 2+ Pokemon, a "+N" badge sits in the bottom-right.
 * If `justToggled` is true, the marker pops via a one-shot CSS animation.
 */
export function buildMarkerIcon(options: MarkerOptions): L.DivIcon {
  const [first] = options.pokemonNames;
  const extra = options.pokemonNames.length - 1;

  let ringClass = options.visited ? 'dx-ring-visited' : 'dx-ring-unvisited';

  // Mythical wins the styling fight (rarer than legendary in canon).
  if (options.hasMythical) {
    ringClass = 'dx-ring-mythical';
  } else if (options.hasLegendary) {
    ringClass = 'dx-ring-legendary';
  }

  const popClass = options.justToggled ? 'dx-pop' : '';
  const spriteSrc = first ? spriteUrl(first) : '';
  const spriteAlt = first ?? 'manhole';
  const badge = extra > 0 ? `<span class="dx-badge">+${extra}</span>` : '';

  return L.divIcon({
    className: '',
    html: `
      <div class="dx-marker ${ringClass} ${popClass}">
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
