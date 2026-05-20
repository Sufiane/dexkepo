<script lang="ts">
  import type { ManholeSummary } from '@dexkepo/shared';
  import { filters } from '../stores/filters';
  import PokemonSearch from './PokemonSearch.svelte';

  type Props = {
    manholes: ManholeSummary[];
    prefectures: string[];
    visitedCount: number;
    totalCount: number;
  };

  let { manholes, prefectures, visitedCount, totalCount }: Props = $props();

  function togglePref(name: string): void {
    filters.update((current) => {
      const set = new Set(current.prefectures);

      if (set.has(name)) {
        set.delete(name);
      } else {
        set.add(name);
      }

      return { ...current, prefectures: [...set] };
    });
  }
</script>

<aside
  class="flex w-full flex-col gap-4 border-b border-slate-200 bg-white p-3 md:w-72 md:border-b-0 md:border-r md:overflow-y-auto
         dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
>
  <div>
    <div class="flex items-center justify-between">
      <span class="text-sm font-semibold">Progress</span>
      <span class="text-sm tabular-nums text-slate-600 dark:text-slate-400">
        {visitedCount} / {totalCount}
      </span>
    </div>
    <div class="mt-1 h-2 w-full overflow-hidden rounded bg-slate-100 dark:bg-slate-800">
      <div
        class="h-full bg-green-600 transition-all"
        style="width: {totalCount ? ((visitedCount / totalCount) * 100).toFixed(1) : 0}%"
      ></div>
    </div>
  </div>

  <PokemonSearch manholes={manholes} />

  <div class="space-y-1 text-sm">
    <label class="flex items-center gap-2">
      <input type="checkbox" bind:checked={$filters.showVisited} />
      <span>Show visited (green)</span>
    </label>
    <label class="flex items-center gap-2">
      <input type="checkbox" bind:checked={$filters.showUnvisited} />
      <span>Show unvisited (gray)</span>
    </label>
  </div>

  <details class="text-sm">
    <summary class="cursor-pointer font-semibold">
      Prefectures ({$filters.prefectures.length || 'all'})
    </summary>
    <div class="mt-2 max-h-56 overflow-y-auto rounded border border-slate-200 p-2 dark:border-slate-700 dark:bg-slate-800/50">
      {#each prefectures as prefecture}
        <label class="flex items-center gap-2">
          <input
            type="checkbox"
            checked={$filters.prefectures.includes(prefecture)}
            onchange={() => togglePref(prefecture)}
          />
          <span>{prefecture}</span>
        </label>
      {/each}
    </div>
    {#if $filters.prefectures.length}
      <button
        class="mt-1 text-xs text-slate-500 hover:underline dark:text-slate-400"
        onclick={() => filters.update((current) => ({ ...current, prefectures: [] }))}
      >clear</button>
    {/if}
  </details>
</aside>
