<!-- web/src/lib/components/landing/MapSection.svelte -->
<script lang="ts">
  import { createQuery, useQueryClient } from '@tanstack/svelte-query';
  import type { ManholeSummary } from '@dexkepo/shared';
  import { listManholes } from '$lib/api/manholes';
  import { listDex } from '$lib/api/dex';
  import { auth } from '$lib/stores/auth';
  import { filters, isFiltered, resetFilters } from '$lib/stores/filters';
  import { t } from '$lib/i18n/locale';
  import Map from '$lib/map/Map.svelte';
  import FilterBar from '$lib/components/FilterBar.svelte';
  import ManholePanel from '$lib/components/ManholePanel.svelte';
  import MapLoader from './MapLoader.svelte';
  import MapError from './MapError.svelte';

  const queryClient = useQueryClient();

  const manholesQ = createQuery<ManholeSummary[]>({
    queryKey: ['manholes'],
    queryFn: () => listManholes(),
  });

  const dexQ = createQuery({
    queryKey: ['dex'],
    queryFn: listDex,
    enabled: !!$auth,
  });

  // Refetch dex when auth changes (login / logout while on the page).
  $effect(() => {
    void $auth;
    queryClient.invalidateQueries({ queryKey: ['dex'] });
  });

  let selected: ManholeSummary | null = $state(null);
  let justToggledNo: string | null = $state(null);
  let fitTrigger = $state(0);
  let focusTarget: { lat: number; lng: number } | null = $state(null);

  const all = $derived($manholesQ.data ?? []);
  const visitedSet = $derived(
    new Set(($dexQ.data ?? []).map((entry) => entry.manholeNo)),
  );

  const prefectures = $derived(
    Array.from(new Set(all.map((manhole) => manhole.prefEnName))).sort(),
  );

  const filtered = $derived(
    all.filter((manhole) => {
      if (
        $filters.prefectures.length > 0 &&
        !$filters.prefectures.includes(manhole.prefEnName)
      ) {
        return false;
      }

      if (
        $filters.pokemonSearch &&
        !manhole.pokemonNames.includes($filters.pokemonSearch)
      ) {
        return false;
      }

      if ($filters.legendaryOnly && !manhole.hasLegendary) {
        return false;
      }

      if ($filters.mythicalOnly && !manhole.hasMythical) {
        return false;
      }

      if ($filters.unvisitedOnly && visitedSet.has(manhole.manholeNo)) {
        return false;
      }

      return true;
    }),
  );

  // Refit the map whenever the filter changes the result set. Tracking the
  // search/prefecture pair separately avoids spurious refits on marker toggles.
  let lastFitKey = '';
  $effect(() => {
    const key = `${$filters.pokemonSearch}|${$filters.prefectures.join(',')}|${$filters.legendaryOnly}|${$filters.mythicalOnly}|${$filters.unvisitedOnly}`;

    if (key !== lastFitKey) {
      lastFitKey = key;
      fitTrigger += 1;
    }
  });

  function handleToggle(manholeNo: string): void {
    queryClient.invalidateQueries({ queryKey: ['dex'] });
    queryClient.invalidateQueries({ queryKey: ['achievements'] });
    queryClient.invalidateQueries({ queryKey: ['favorites'] });

    justToggledNo = manholeNo;
    setTimeout(() => {
      if (justToggledNo === manholeNo) {
        justToggledNo = null;
      }
    }, 700);
  }
</script>

<section
  id="map"
  class="relative h-dvh w-full border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
>
  <div class="absolute inset-0 flex flex-col md:flex-row">
    <FilterBar
      manholes={all}
      prefectures={prefectures}
      visitedCount={visitedSet.size}
      totalCount={all.length}
      visitedSet={visitedSet}
      onPickRandom={(manhole) => {
        // Clear filters that might hide the chosen cover, fly the map onto
        // it, and open the panel. New object identity on focusTarget forces
        // the Map's $effect to re-run even when coords happen to repeat.
        resetFilters();
        focusTarget = { lat: manhole.lat, lng: manhole.lng };
        selected = manhole;
      }}
    />

    <div class="relative min-h-0 flex-1">
      {#if $manholesQ.isLoading}
        <MapLoader />
      {:else if $manholesQ.isError}
        <MapError
          message={($manholesQ.error as Error).message}
          onRetry={() => $manholesQ.refetch()}
        />
      {:else}
        <Map
          manholes={filtered}
          visitedSet={visitedSet}
          showVisited={$filters.showVisited}
          showUnvisited={$filters.showUnvisited}
          justToggledNo={justToggledNo}
          fitTrigger={fitTrigger}
          focus={focusTarget}
          onSelect={(manhole) => (selected = manhole)}
        />
        {#if filtered.length === 0 && isFiltered($filters)}
          <div
            class="pointer-events-none absolute inset-x-0 top-4 z-[500] flex justify-center px-4"
          >
            <div
              class="pointer-events-auto flex items-center gap-3 rounded-full bg-white px-4 py-2 text-sm shadow-lg ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700"
            >
              <span>{$t('filter.emptyResult')}</span>
              <button
                type="button"
                onclick={resetFilters}
                class="rounded-full bg-rose-500 px-3 py-1 text-xs font-bold text-white hover:bg-rose-600"
              >
                {$t('filter.clearAll')}
              </button>
            </div>
          </div>
        {/if}
        {#if selected}
          {#key selected.manholeNo}
            <ManholePanel
              manholeNo={selected.manholeNo}
              name={selected.name}
              prefEnName={selected.prefEnName}
              pictureUrl={selected.pictureUrl}
              pokemonNames={selected.pokemonNames}
              lat={selected.lat}
              lng={selected.lng}
              visited={visitedSet.has(selected.manholeNo)}
              onClose={() => (selected = null)}
              onToggle={() => handleToggle(selected!.manholeNo)}
            />
          {/key}
        {/if}
      {/if}
    </div>
  </div>
</section>
