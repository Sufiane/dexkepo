<script lang="ts">
  import type { ManholeSummary } from '@dexkepo/shared';
  import { filters } from '../stores/filters';
  import { spriteUrl } from '../utils/pokemonSprite';

  type Suggestion = { name: string; count: number };

  type Props = {
    manholes: ManholeSummary[];
  };

  let { manholes }: Props = $props();

  let query = $state('');
  let focused = $state(false);

  // Build a name -> count index from the slim manholes list.
  const index = $derived.by(() => {
    const map = new Map<string, number>();

    for (const manhole of manholes) {
      for (const name of manhole.pokemonNames) {
        map.set(name, (map.get(name) ?? 0) + 1);
      }
    }

    return [...map.entries()]
      .map(([name, count]): Suggestion => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  });

  const matches = $derived.by(() => {
    const term = query.trim().toLowerCase();

    if (!term) {
      return [] as Suggestion[];
    }

    return index
      .filter((suggestion) => suggestion.name.toLowerCase().includes(term))
      .slice(0, 8);
  });

  function pick(name: string): void {
    filters.update((current) => ({ ...current, pokemonSearch: name }));
    query = name;
    focused = false;
  }

  function clearSearch(): void {
    filters.update((current) => ({ ...current, pokemonSearch: '' }));
    query = '';
  }
</script>

<div class="relative">
  <label class="block">
    <span class="text-xs font-bold uppercase tracking-widest text-slate-500">
      Find a Pokémon
    </span>
    <div class="relative mt-1">
      <input
        type="text"
        placeholder="Pikachu, Eevee…"
        bind:value={query}
        onfocus={() => (focused = true)}
        onblur={() => setTimeout(() => (focused = false), 120)}
        class="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 pr-8 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
      />
      {#if query || $filters.pokemonSearch}
        <button
          type="button"
          onclick={clearSearch}
          class="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Clear search"
        >
          <svg viewBox="0 0 20 20" class="h-4 w-4" fill="currentColor">
            <path d="M5.28 4.22a.75.75 0 00-1.06 1.06L8.94 10l-4.72 4.72a.75.75 0 101.06 1.06L10 11.06l4.72 4.72a.75.75 0 101.06-1.06L11.06 10l4.72-4.72a.75.75 0 00-1.06-1.06L10 8.94 5.28 4.22z" />
          </svg>
        </button>
      {/if}
    </div>
  </label>

  {#if focused && matches.length}
    <ul
      class="absolute left-0 right-0 z-50 mt-1 max-h-72 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg"
    >
      {#each matches as suggestion}
        <li>
          <button
            type="button"
            onmousedown={() => pick(suggestion.name)}
            class="flex w-full items-center gap-2 px-2 py-1.5 text-left text-sm hover:bg-rose-50"
          >
            <img
              src={spriteUrl(suggestion.name)}
              alt=""
              class="h-7 w-7 object-contain"
              loading="lazy"
              style="image-rendering: pixelated;"
              onerror={(e) => ((e.currentTarget as HTMLImageElement).style.visibility = 'hidden')}
            />
            <span class="flex-1 font-medium text-slate-800">{suggestion.name}</span>
            <span class="text-xs tabular-nums text-slate-500">
              {suggestion.count} cover{suggestion.count === 1 ? '' : 's'}
            </span>
          </button>
        </li>
      {/each}
    </ul>
  {/if}

  {#if $filters.pokemonSearch}
    <div class="mt-2 inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-800">
      <img
        src={spriteUrl($filters.pokemonSearch)}
        alt=""
        class="h-5 w-5 object-contain"
        style="image-rendering: pixelated;"
        onerror={(e) => ((e.currentTarget as HTMLImageElement).style.visibility = 'hidden')}
      />
      <span>{$filters.pokemonSearch}</span>
      <button
        type="button"
        onclick={clearSearch}
        class="ml-1 rounded-full text-rose-700 hover:text-rose-900"
        aria-label="Clear"
      >×</button>
    </div>
  {/if}
</div>
