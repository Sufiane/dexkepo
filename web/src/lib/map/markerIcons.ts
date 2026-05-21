import L from 'leaflet';
import { spriteUrl } from '../utils/pokemonSprite';

type MarkerOptions = {
  pokemonNames: string[];
  visited: boolean;
  hasLegendary?: boolean;
  hasMythical?: boolean;
  justToggled?: boolean;
};

type MarkerExtras = {
  hasLegendary: boolean;
  hasMythical: boolean;
};

/**
 * WeakMap that tracks rarity flags per Leaflet marker instance.
 * Keyed on the marker so there is no manual cleanup when markers are removed.
 */
const markerExtrasMap = new WeakMap<L.Marker, MarkerExtras>();

/**
 * Register rarity metadata for a marker so `clusterIcon`'s
 * `iconCreateFunction` can read it when building cluster bubbles.
 */
export function registerMarkerExtras(marker: L.Marker, extras: MarkerExtras): void {
  markerExtrasMap.set(marker, extras);
}

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

    let hasLegendary = false;
    let hasMythical = false;

    for (const marker of cluster.getAllChildMarkers()) {
      const extras = markerExtrasMap.get(marker as L.Marker);

      if (extras?.hasMythical) {
        hasMythical = true;
        break; // Mythical is the highest priority — no need to scan further.
      }

      if (extras?.hasLegendary) {
        hasLegendary = true;
      }
    }

    // Mythical wins the styling fight (rarer than legendary in canon).
    let rarityClass = '';

    if (hasMythical) {
      rarityClass = 'dx-cluster-mythical';
    } else if (hasLegendary) {
      rarityClass = 'dx-cluster-legendary';
    }

    const classes = ['dx-cluster', kind, rarityClass].filter(Boolean).join(' ');

    return L.divIcon({
      html: `<div class="${classes}" style="width:${size}px;height:${size}px;">${count}</div>`,
      className: '',
      iconSize: [size, size],
    });
  };
}
