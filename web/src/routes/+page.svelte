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

  const queryClient = useQueryClient();

  const manholesQ = createQuery<ManholeSummary[]>({
    queryKey: ['manholes'],
    queryFn: listManholes,
  });

  const dexQ = createQuery({
    queryKey: ['dex'],
    queryFn: listDex,
    enabled: !!$auth,
  });

  // Refetch dex when auth changes
  $effect(() => {
    void $auth;
    queryClient.invalidateQueries({ queryKey: ['dex'] });
  });

  let selected: ManholeSummary | null = $state(null);
  let justToggledNo: string | null = $state(null);

  const all = $derived($manholesQ.data ?? []);
  const visitedSet = $derived(
    new Set(($dexQ.data ?? []).map((entry) => entry.manholeNo)),
  );

  const prefectures = $derived(
    Array.from(new Set(all.map((manhole) => manhole.prefEnName))).sort(),
  );

  const filtered = $derived(
    all.filter(
      (manhole) =>
        $filters.prefectures.length === 0 ||
        $filters.prefectures.includes(manhole.prefEnName),
    ),
  );

  function handleToggle(manholeNo: string): void {
    queryClient.invalidateQueries({ queryKey: ['dex'] });

    // Trigger the pop animation on the just-toggled marker, then clear so
    // re-renders don't keep replaying it.
    justToggledNo = manholeNo;
    setTimeout(() => {
      if (justToggledNo === manholeNo) {
        justToggledNo = null;
      }
    }, 700);
  }
</script>

<div class="absolute inset-0 flex flex-col md:flex-row">
  {#if $manholesQ.isLoading}
    <div class="flex flex-1 items-center justify-center text-slate-500">Loading map…</div>
  {:else if $manholesQ.isError}
    <div class="flex flex-1 items-center justify-center text-red-600">
      Failed to load manholes: {($manholesQ.error as Error).message}
    </div>
  {:else}
    <FilterBar
      prefectures={prefectures}
      visitedCount={visitedSet.size}
      totalCount={all.length}
    />
    <div class="relative min-h-0 flex-1">
      <Map
        manholes={filtered}
        visitedSet={visitedSet}
        showVisited={$filters.showVisited}
        showUnvisited={$filters.showUnvisited}
        justToggledNo={justToggledNo}
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
            visited={visitedSet.has(selected.manholeNo)}
            onClose={() => (selected = null)}
            onToggle={() => handleToggle(selected!.manholeNo)}
          />
        {/key}
      {/if}
    </div>
  {/if}
</div>
