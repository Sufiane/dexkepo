<script lang="ts">
  import type { FavoritePokemon, FavoritesResponse } from '@dexkepo/shared';
  import { spriteUrl } from '../utils/pokemonSprite';
  import FavoritesPodiumSkeleton from './skeletons/FavoritesPodiumSkeleton.svelte';

  type Props = {
    data: FavoritesResponse | undefined;
    loading: boolean;
  };

  let { data, loading }: Props = $props();

  // Visual treatment per podium slot — biggest sprite for #1, smaller for the others.
  const podiumClasses = ['scale-110', 'scale-100', 'scale-95'];

  function pct(favorite: FavoritePokemon): string {
    return `${Math.round(favorite.ratio * 100)}%`;
  }
</script>

<section
  class="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200
         dark:bg-slate-900 dark:ring-slate-700"
>
  <h2 class="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
    Your favourite Pokémon
  </h2>

  {#if loading}
    <FavoritesPodiumSkeleton />
  {:else if !data || (data.favorites.length === 0 && !data.completedAll)}
    <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
      Mark a few covers to see who your favourite Pokémon really is.
    </p>
  {:else if data.completedAll && data.favorites.length === 1}
    {@const chosen = data.favorites[0]}
    <div class="mt-3 flex items-center gap-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-100 p-4 ring-2 ring-amber-300 dark:from-amber-950/40 dark:to-orange-950/40 dark:ring-amber-700">
      <img
        src={spriteUrl(chosen.name)}
        alt={chosen.name}
        class="h-24 w-24 flex-shrink-0 object-contain"
        style="image-rendering: pixelated;"
        onerror={(event) => ((event.currentTarget as HTMLImageElement).style.visibility = 'hidden')}
      />
      <div>
        <p class="text-[10px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-300">
          👑 Self-declared favorite
        </p>
        <p class="mt-1 text-2xl font-extrabold text-slate-900 dark:text-slate-100">
          {chosen.name}
        </p>
        <p class="text-xs text-slate-600 dark:text-slate-400">
          Completed all {chosen.totalCount} cover{chosen.totalCount === 1 ? '' : 's'}.
        </p>
      </div>
    </div>
  {:else if data.completedAll}
    <p class="mt-2 text-base font-semibold text-slate-900 dark:text-slate-100">
      👑 You've visited every cover — they're <em>all</em> your favourites.
    </p>
  {:else}
    <div class="mt-3 grid grid-cols-3 gap-3">
      {#each data.favorites as favorite, index (favorite.name)}
        <div
          class={`flex flex-col items-center rounded-2xl p-3 text-center transition ${
            index === 0
              ? 'bg-gradient-to-br from-amber-50 to-orange-100 ring-2 ring-amber-300 dark:from-amber-950/40 dark:to-orange-950/40 dark:ring-amber-700'
              : 'bg-slate-50 ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700'
          }`}
        >
          <span class="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            #{index + 1}
          </span>
          <img
            src={spriteUrl(favorite.name)}
            alt={favorite.name}
            class={`mt-1 h-16 w-16 object-contain ${podiumClasses[index] ?? ''}`}
            style="image-rendering: pixelated;"
            onerror={(event) => ((event.currentTarget as HTMLImageElement).style.visibility = 'hidden')}
          />
          <p class="mt-1 text-sm font-bold text-slate-900 dark:text-slate-100">
            {favorite.name}
          </p>
          <p class="text-[11px] tabular-nums text-slate-600 dark:text-slate-400">
            {favorite.visitedCount} / {favorite.totalCount}
          </p>
          <p class="text-[10px] font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            {pct(favorite)}
          </p>
        </div>
      {/each}
    </div>
  {/if}
</section>
