<script lang="ts">
  import { createQuery, useQueryClient } from '@tanstack/svelte-query';
  import { derived } from 'svelte/store';
  import type { Manhole } from '@dexkepo/shared';
  import { listManholes } from '$lib/api/manholes';
  import { listDex } from '$lib/api/dex';
  import { auth } from '$lib/stores/auth';
  import { filters } from '$lib/stores/filters';
  import Map from '$lib/map/Map.svelte';
  import FilterBar from '$lib/components/FilterBar.svelte';
  import ManholePanel from '$lib/components/ManholePanel.svelte';

  const qc = useQueryClient();

  const manholesQ = createQuery<Manhole[]>({
    queryKey: ['manholes'],
    queryFn: listManholes
  });

  const dexQ = createQuery({
    queryKey: ['dex'],
    queryFn: listDex,
    enabled: !!$auth
  });

  // Refetch dex when auth changes
  $effect(() => {
    void $auth;
    qc.invalidateQueries({ queryKey: ['dex'] });
  });

  let selected: Manhole | null = $state(null);

  const all = $derived($manholesQ.data ?? []);
  const visitedSet = $derived(new Set(($dexQ.data ?? []).map((e) => e.manholeNo)));

  const prefectures = $derived(
    Array.from(new Set(all.map((m) => m.prefEnName))).sort()
  );

  const filtered = $derived(
    all.filter((m) =>
      $filters.prefectures.length === 0 || $filters.prefectures.includes(m.prefEnName)
    )
  );

  function handleToggle() {
    qc.invalidateQueries({ queryKey: ['dex'] });
  }
</script>

<div class="flex h-full flex-col md:flex-row">
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
        onSelect={(m) => (selected = m)}
      />
      {#if selected}
        <ManholePanel
          manhole={selected}
          visited={visitedSet.has(selected.manholeNo)}
          onClose={() => (selected = null)}
          onToggle={handleToggle}
        />
      {/if}
    </div>
  {/if}
</div>
