<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import L from 'leaflet';
  import 'leaflet.markercluster';
  import type { ManholeSummary } from '@dexkepo/shared';
  import { buildMarkerIcon, clusterIcon, registerMarkerExtras } from './markerIcons';
  import { theme } from '../stores/theme';

  /**
   * CartoCDN basemaps — free, no API key required for normal use, Latin labels
   * everywhere (no more Japanese-only street names). Voyager for light theme,
   * dark_all for dark. Standard OSM attribution still required since the tiles
   * derive from OSM data.
   */
  const LIGHT_TILE_URL =
    'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
  const DARK_TILE_URL =
    'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
  const TILE_ATTRIBUTION =
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · &copy; <a href="https://carto.com/attributions">CARTO</a>';

  type Props = {
    manholes: ManholeSummary[];
    visitedSet: Set<string>;
    showVisited: boolean;
    showUnvisited: boolean;
    justToggledNo: string | null;
    /** Incrementing number that signals "refit map bounds to current data". */
    fitTrigger: number;
    /** Optional lat/lng to zoom in on. Re-applied whenever the object identity changes. */
    focus?: { lat: number; lng: number } | null;
    onSelect: (m: ManholeSummary) => void;
  };

  let {
    manholes,
    visitedSet,
    showVisited,
    showUnvisited,
    justToggledNo,
    fitTrigger,
    focus = null,
    onSelect,
  }: Props = $props();

  let lastFitTrigger = -1;

  let container: HTMLDivElement;
  let map: L.Map | null = null;
  let tileLayer: L.TileLayer | null = null;
  let visitedLayer: L.MarkerClusterGroup | null = null;
  let unvisitedLayer: L.MarkerClusterGroup | null = null;
  let resizeObs: ResizeObserver | null = null;
  let mounted = false;
  let currentTheme: 'light' | 'dark' = 'light';

  function buildTileLayer(forTheme: 'light' | 'dark'): L.TileLayer {
    return L.tileLayer(forTheme === 'dark' ? DARK_TILE_URL : LIGHT_TILE_URL, {
      attribution: TILE_ATTRIBUTION,
      maxZoom: 19,
      subdomains: 'abcd',
    });
  }

  onMount(() => {
    map = L.map(container, { worldCopyJump: false }).setView([36.5, 138], 5);
    currentTheme = $theme;
    tileLayer = buildTileLayer(currentTheme).addTo(map);

    visitedLayer = (L as any).markerClusterGroup({
      iconCreateFunction: clusterIcon('visited'),
      showCoverageOnHover: false
    });
    unvisitedLayer = (L as any).markerClusterGroup({
      iconCreateFunction: clusterIcon('unvisited'),
      showCoverageOnHover: false
    });
    mounted = true;

    // CRITICAL: at this point the flex parent might still be sizing.
    // We must invalidateSize BEFORE refresh(), otherwise fitBounds runs
    // against a 0×0 box, picks a worldwide zoom level, and loads tiles
    // for huge areas that never get re-requested when the container grows.
    requestAnimationFrame(() => {
      map?.invalidateSize();
      refresh();
    });

    // Handle viewport resize / parent layout changes.
    resizeObs = new ResizeObserver(() => map?.invalidateSize());
    resizeObs.observe(container);
  });

  onDestroy(() => {
    resizeObs?.disconnect();
    resizeObs = null;
    map?.remove();
    map = null;
  });

  function refresh() {
    if (!map || !visitedLayer || !unvisitedLayer) {
      return;
    }

    visitedLayer.clearLayers();
    unvisitedLayer.clearLayers();

    const bounds: L.LatLngTuple[] = [];

    for (const manhole of manholes) {
      const visited = visitedSet.has(manhole.manholeNo);
      const marker = L.marker([manhole.lat, manhole.lng], {
        icon: buildMarkerIcon({
          pokemonNames: manhole.pokemonNames,
          visited,
          hasLegendary: manhole.hasLegendary,
          hasMythical: manhole.hasMythical,
          justToggled: manhole.manholeNo === justToggledNo,
        }),
      });

      registerMarkerExtras(marker, {
        hasLegendary: manhole.hasLegendary,
        hasMythical: manhole.hasMythical,
      });

      marker.on('click', () => onSelect(manhole));

      if (visited) {
        visitedLayer.addLayer(marker);
      } else {
        unvisitedLayer.addLayer(marker);
      }

      bounds.push([manhole.lat, manhole.lng]);
    }

    if (showVisited) {
      visitedLayer.addTo(map);
    } else {
      map.removeLayer(visitedLayer);
    }

    if (showUnvisited) {
      unvisitedLayer.addTo(map);
    } else {
      map.removeLayer(unvisitedLayer);
    }

    // Fit on first load (zoom is still the initial 5) OR when the parent
    // bumps fitTrigger (e.g. after applying a search).
    const shouldFit = bounds.length && (map.getZoom() === 5 || fitTrigger !== lastFitTrigger);

    if (shouldFit) {
      lastFitTrigger = fitTrigger;
      map.fitBounds(bounds as any, { padding: [40, 40], maxZoom: 12 });
    }
  }

  $effect(() => {
    // re-run when any reactive input changes
    void manholes;
    void visitedSet;
    void showVisited;
    void showUnvisited;
    void justToggledNo;
    void fitTrigger;

    if (mounted) {
      refresh();
    }
  });

  // Center on `focus` when it changes (random-pick, deep link, etc.).
  $effect(() => {
    const target = focus;

    if (!mounted || !map || !target) {
      return;
    }

    map.flyTo([target.lat, target.lng], 14, { duration: 0.6 });
  });

  // Swap the tile layer when the user toggles dark mode.
  $effect(() => {
    const next = $theme;

    if (!mounted || !map || next === currentTheme) {
      return;
    }

    if (tileLayer) {
      map.removeLayer(tileLayer);
    }

    tileLayer = buildTileLayer(next).addTo(map);
    currentTheme = next;
  });
</script>

<div bind:this={container} class="absolute inset-0"></div>
