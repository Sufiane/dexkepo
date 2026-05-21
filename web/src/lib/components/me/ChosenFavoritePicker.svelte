<script lang="ts">
  import type { ManholeSummary } from '@dexkepo/shared';
  import { auth, patchUser } from '$lib/stores/auth';
  import { updateProfile } from '$lib/api/users';
  import { spriteUrl } from '$lib/utils/pokemonSprite';
  import { t } from '$lib/i18n/locale';

  type Props = {
    manholes: ManholeSummary[];
    /** Optional callback after a save lands; lets parent refetch favorites query. */
    onChange?: () => void;
  };

  let { manholes, onChange }: Props = $props();

  let query = $state('');
  let focused = $state(false);
  let saving = $state(false);
  let errorMsg = $state('');

  const current = $derived($auth?.user.chosenFavorite ?? null);

  type Suggestion = { name: string; count: number };

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

  async function save(name: string | null): Promise<void> {
    saving = true;
    errorMsg = '';

    try {
      const updated = await updateProfile({ chosenFavorite: name });

      patchUser({ chosenFavorite: updated.chosenFavorite });
      query = '';
      focused = false;
      onChange?.();
    } catch (err) {
      errorMsg = err instanceof Error ? err.message : $t('me.chosenFavorite.cantSave');
    } finally {
      saving = false;
    }
  }
</script>

<section
  class="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-amber-200
         dark:bg-slate-900 dark:ring-amber-700"
>
  <p class="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
    {$t('me.chosenFavorite.kicker')}
  </p>
  <h3 class="mt-1 text-base font-extrabold text-slate-900 dark:text-slate-100">
    {$t('me.chosenFavorite.title')}
  </h3>
  <p class="mt-1 text-xs text-slate-500">
    {$t('me.chosenFavorite.help')}
  </p>

  {#if current}
    <div class="mt-3 flex items-center gap-3 rounded-xl bg-amber-50 p-3 dark:bg-amber-950/30">
      <img
        src={spriteUrl(current)}
        alt={current}
        class="h-14 w-14 object-contain"
        style="image-rendering: pixelated;"
        onerror={(event) => ((event.currentTarget as HTMLImageElement).style.visibility = 'hidden')}
      />
      <div class="flex-1">
        <p class="text-[10px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-300">
          {$t('me.chosenFavorite.current')}
        </p>
        <p class="text-lg font-extrabold text-slate-900 dark:text-slate-100">{current}</p>
      </div>
      <button
        type="button"
        onclick={() => save(null)}
        disabled={saving}
        class="rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-700 hover:bg-slate-300 disabled:opacity-50 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
      >
        {$t('me.chosenFavorite.clear')}
      </button>
    </div>
  {/if}

  <div class="relative mt-3">
    <input
      type="text"
      placeholder={current ? $t('me.chosenFavorite.changeTo') : $t('me.chosenFavorite.placeholder')}
      bind:value={query}
      onfocus={() => (focused = true)}
      onblur={() => setTimeout(() => (focused = false), 120)}
      disabled={saving}
      class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
    />

    {#if focused && matches.length}
      <ul
        class="absolute left-0 right-0 z-50 mt-1 max-h-72 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800"
      >
        {#each matches as suggestion (suggestion.name)}
          <li>
            <button
              type="button"
              onmousedown={() => save(suggestion.name)}
              class="flex w-full items-center gap-2 px-2 py-1.5 text-left text-sm hover:bg-rose-50 dark:hover:bg-slate-700"
            >
              <img
                src={spriteUrl(suggestion.name)}
                alt=""
                class="h-7 w-7 object-contain"
                loading="lazy"
                style="image-rendering: pixelated;"
                onerror={(event) => ((event.currentTarget as HTMLImageElement).style.visibility = 'hidden')}
              />
              <span class="flex-1 font-medium text-slate-800 dark:text-slate-100">
                {suggestion.name}
              </span>
              <span class="text-xs tabular-nums text-slate-500">
                {suggestion.count}
              </span>
            </button>
          </li>
        {/each}
      </ul>
    {/if}
  </div>

  {#if errorMsg}
    <p class="mt-2 text-xs text-rose-500">{errorMsg}</p>
  {/if}
</section>
