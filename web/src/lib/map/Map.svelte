<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import L from 'leaflet';
  import 'leaflet.markercluster';
  import type { ManholeSummary } from '@dexkepo/shared';
  import { buildMarkerIcon, clusterIcon } from './markerIcons';

  type Props = {
    manholes: ManholeSummary[];
    visitedSet: Set<string>;
    showVisited: boolean;
    showUnvisited: boolean;
    onSelect: (m: ManholeSummary) => void;
  };

  let { manholes, visitedSet, showVisited, showUnvisited, onSelect }: Props = $props();

  let container: HTMLDivElement;
  let map: L.Map | null = null;
  let visitedLayer: L.MarkerClusterGroup | null = null;
  let unvisitedLayer: L.MarkerClusterGroup | null = null;
  let resizeObs: ResizeObserver | null = null;
  let mounted = false;

  onMount(() => {
    map = L.map(container, { worldCopyJump: false }).setView([36.5, 138], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19
    }).addTo(map);

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
        }),
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

    if (bounds.length && map.getZoom() === 5) {
      map.fitBounds(bounds as any, { padding: [40, 40] });
    }
  }

  $effect(() => {
    // re-run when any reactive input changes
    void manholes;
    void visitedSet;
    void showVisited;
    void showUnvisited;

    if (mounted) {
      refresh();
    }
  });
</script>

<div bind:this={container} class="absolute inset-0"></div>
