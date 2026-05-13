<script lang="ts">
  import { filters } from '../stores/filters';

  type Props = {
    prefectures: string[];
    visitedCount: number;
    totalCount: number;
  };

  let { prefectures, visitedCount, totalCount }: Props = $props();

  function togglePref(p: string) {
    filters.update((f) => {
      const set = new Set(f.prefectures);
      if (set.has(p)) set.delete(p);
      else set.add(p);
      return { ...f, prefectures: [...set] };
    });
  }
</script>

<aside class="flex w-full flex-col gap-3 border-b border-slate-200 bg-white p-3 md:w-72 md:border-b-0 md:border-r">
  <div class="flex items-center justify-between">
    <span class="text-sm font-semibold">Progress</span>
    <span class="text-sm tabular-nums text-slate-600">{visitedCount} / {totalCount}</span>
  </div>
  <div class="h-2 w-full overflow-hidden rounded bg-slate-100">
    <div class="h-full bg-green-600 transition-all"
         style="width: {totalCount ? (visitedCount / totalCount * 100).toFixed(1) : 0}%"></div>
  </div>

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
    <summary class="cursor-pointer font-semibold">Prefectures ({$filters.prefectures.length || 'all'})</summary>
    <div class="mt-2 max-h-56 overflow-y-auto rounded border border-slate-200 p-2">
      {#each prefectures as p}
        <label class="flex items-center gap-2">
          <input
            type="checkbox"
            checked={$filters.prefectures.includes(p)}
            onchange={() => togglePref(p)}
          />
          <span>{p}</span>
        </label>
      {/each}
    </div>
    {#if $filters.prefectures.length}
      <button
        class="mt-1 text-xs text-slate-500 hover:underline"
        onclick={() => filters.update((f) => ({ ...f, prefectures: [] }))}
      >clear</button>
    {/if}
  </details>
</aside>
