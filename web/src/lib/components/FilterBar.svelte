<script lang="ts">
  import type { ManholeSummary } from '@dexkepo/shared';
  import { filters } from '../stores/filters';
  import { t, locale } from '$lib/i18n/locale';
  import { localisedPrefecture } from '$lib/i18n/prefectures';
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
      <span class="text-sm font-semibold">{$t('filter.progress')}</span>
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
      <span>{$t('filter.showVisited')}</span>
    </label>
    <label class="flex items-center gap-2">
      <input type="checkbox" bind:checked={$filters.showUnvisited} />
      <span>{$t('filter.showUnvisited')}</span>
    </label>
  </div>

  <div class="flex flex-wrap gap-1.5">
    <button
      type="button"
      aria-pressed={$filters.legendaryOnly}
      onclick={() => filters.update((current) => ({ ...current, legendaryOnly: !current.legendaryOnly }))}
      class={$filters.legendaryOnly
        ? 'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold bg-amber-500 text-white dark:bg-amber-400 dark:text-amber-950'
        : 'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold bg-amber-50 text-amber-800 ring-1 ring-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-700'}
    >
      ⭐ {$t('filter.legendaryOnly')}
    </button>
    <button
      type="button"
      aria-pressed={$filters.mythicalOnly}
      onclick={() => filters.update((current) => ({ ...current, mythicalOnly: !current.mythicalOnly }))}
      class={$filters.mythicalOnly
        ? 'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold bg-pink-500 text-white dark:bg-pink-400 dark:text-pink-950'
        : 'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold bg-pink-50 text-pink-800 ring-1 ring-pink-300 dark:bg-pink-950/40 dark:text-pink-300 dark:ring-pink-700'}
    >
      ✨ {$t('filter.mythicalOnly')}
    </button>
    <button
      type="button"
      aria-pressed={$filters.unvisitedOnly}
      onclick={() => filters.update((current) => ({ ...current, unvisitedOnly: !current.unvisitedOnly }))}
      class={$filters.unvisitedOnly
        ? 'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold bg-slate-700 text-white dark:bg-slate-300 dark:text-slate-900'
        : 'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold bg-slate-100 text-slate-700 ring-1 ring-slate-300 dark:bg-slate-800/60 dark:text-slate-300 dark:ring-slate-600'}
    >
      🗺️ {$t('filter.unvisitedOnly')}
    </button>
  </div>

  <details class="text-sm">
    <summary class="cursor-pointer font-semibold">
      {$t('filter.prefectures')} ({$filters.prefectures.length || $t('filter.all')})
    </summary>
    <div class="mt-2 max-h-56 overflow-y-auto rounded border border-slate-200 p-2 dark:border-slate-700 dark:bg-slate-800/50">
      {#each prefectures as prefecture}
        <label class="flex items-center gap-2">
          <input
            type="checkbox"
            checked={$filters.prefectures.includes(prefecture)}
            onchange={() => togglePref(prefecture)}
          />
          <span>{localisedPrefecture(prefecture, $locale)}</span>
        </label>
      {/each}
    </div>
    {#if $filters.prefectures.length}
      <button
        class="mt-1 text-xs text-slate-500 hover:underline dark:text-slate-400"
        onclick={() => filters.update((current) => ({ ...current, prefectures: [] }))}
      >{$t('filter.clear')}</button>
    {/if}
  </details>
</aside>
