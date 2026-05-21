<!-- web/src/lib/components/landing/MapSection.svelte -->
<script lang="ts">
  import { createQuery, useQueryClient } from '@tanstack/svelte-query';
  import type { ManholeSummary } from '@dexkepo/shared';
  import { listManholes } from '$lib/api/manholes';
  import { listDex } from '$lib/api/dex';
  import { auth } from '$lib/stores/auth';
  import { filters } from '$lib/stores/filters';
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

      return true;
    }),
  );

  // Refit the map whenever the filter changes the result set. Tracking the
  // search/prefecture pair separately avoids spurious refits on marker toggles.
  let lastFitKey = '';
  $effect(() => {
    const key = `${$filters.pokemonSearch}|${$filters.prefectures.join(',')}`;

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
          onSelect={(manhole) => (selected = manhole)}
        />
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
