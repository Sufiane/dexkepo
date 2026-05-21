<script lang="ts">
  import { page } from '$app/stores';
  import { createQuery } from '@tanstack/svelte-query';
  import { auth } from '$lib/stores/auth';
  import { listManholes } from '$lib/api/manholes';
  import { listDex } from '$lib/api/dex';
  import { t, locale } from '$lib/i18n/locale';
  import { localisedPrefecture } from '$lib/i18n/prefectures';
  import { spriteUrl } from '$lib/utils/pokemonSprite';
  import Skeleton from '$lib/components/skeletons/Skeleton.svelte';

  const PIC_BASE = 'https://local.pokemon.jp';
  const MAX_SPRITES = 3;

  const slug = $derived($page.params.slug ?? '');

  const prefName = $derived(localisedPrefecture(slug, $locale));

  const manholeQ = createQuery({
    queryKey: ['manholes', slug],
    queryFn: () => listManholes(slug),
    staleTime: 5 * 60_000,
  });

  const dexQ = createQuery({
    queryKey: ['dex'],
    queryFn: () => listDex(),
    enabled: $auth !== null,
    staleTime: 60_000,
  });

  const visitedSet = $derived<Set<string>>(
    $auth && $dexQ.data
      ? new Set($dexQ.data.map((entry) => entry.manholeNo))
      : new Set(),
  );

  const totalCount = $derived($manholeQ.data?.length ?? 0);

  const visitedCount = $derived(
    $manholeQ.data
      ? $manholeQ.data.filter((manhole) => visitedSet.has(manhole.manholeNo)).length
      : 0,
  );

  const completion = $derived(
    totalCount === 0 ? 0 : (visitedCount / totalCount) * 100,
  );

  function coverCountLabel(count: number): string {
    if ($locale === 'ja') {
      return `${count}${$t('prefecture.coverPlural')}`;
    }

    return count === 1
      ? `${count} ${$t('prefecture.coverSingular')}`
      : `${count} ${$t('prefecture.coverPlural')}`;
  }
</script>

<div class="h-full overflow-y-auto">
  <div class="mx-auto mt-6 w-full max-w-5xl space-y-6 p-4 pb-12">

    <!-- Hero panel -->
    {#if $manholeQ.isLoading}
      <Skeleton class="h-40 rounded-3xl" />
    {:else}
      <header class="rounded-3xl bg-gradient-to-br from-rose-500 via-red-500 to-orange-500 p-6 text-white shadow-lg">
        <p class="text-xs font-bold uppercase tracking-[.25em] text-white/85">
          {$t('prefecture.kicker')}
        </p>
        <h1 class="mt-1 text-3xl font-extrabold">{prefName}</h1>

        {#if $auth && !$manholeQ.isError && totalCount > 0}
          <div class="mt-5 flex items-end gap-3">
            <div>
              <p class="text-[10px] font-bold uppercase tracking-widest text-white/70">
                {$t('me.progress')}
              </p>
              <p class="text-4xl font-extrabold tabular-nums">
                {visitedCount}<span class="text-2xl text-white/70"> / {totalCount}</span>
              </p>
            </div>
            <p class="ml-auto text-xl font-bold tabular-nums text-white/90">
              {completion.toFixed(1)}%
            </p>
          </div>

          <div class="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/25">
            <div
              class="h-full rounded-full bg-white shadow-inner"
              style="width: {completion.toFixed(1)}%"
            ></div>
          </div>
        {:else if !$manholeQ.isError && totalCount > 0}
          <p class="mt-3 text-sm text-white/80">
            {coverCountLabel(totalCount)}
          </p>
        {/if}
      </header>
    {/if}

    <!-- Error state -->
    {#if $manholeQ.isError}
      <div class="rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950/30">
        <p class="font-semibold text-red-700 dark:text-red-400">{$t('map.errorTitle')}</p>
        <a
          href="/"
          class="mt-3 inline-block text-sm font-semibold text-rose-600 underline hover:text-rose-800"
        >
          {$t('common.backToMap')}
        </a>
      </div>

    <!-- Empty state (slug not found or no covers in prefecture) -->
    {:else if !$manholeQ.isLoading && totalCount === 0}
      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-800/40">
        <p class="text-lg font-extrabold text-slate-800 dark:text-slate-100">
          {$t('prefecture.emptyTitle')}
        </p>
        <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {$t('prefecture.emptySub')}
        </p>
        <a
          href="/"
          class="mt-5 inline-block rounded-lg bg-rose-500 px-5 py-2 text-sm font-bold text-white shadow hover:bg-rose-600"
        >
          {$t('common.backToMap')}
        </a>
      </div>

    <!-- Loading skeleton grid -->
    {:else if $manholeQ.isLoading}
      <div class="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {#each Array(8) as _, index (index)}
          <div class="space-y-2">
            <Skeleton class="aspect-square w-full rounded-xl" />
            <Skeleton class="h-4 w-3/4 rounded" />
            <Skeleton class="h-3 w-1/2 rounded" />
          </div>
        {/each}
      </div>

    <!-- Cover grid -->
    {:else if $manholeQ.data}
      <div class="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {#each $manholeQ.data as manhole (manhole.manholeNo)}
          {@const isVisited = visitedSet.has(manhole.manholeNo)}
          {@const ringClass = manhole.hasMythical
            ? 'ring-2 ring-pink-400 shadow-[0_0_0_3px_rgba(236,72,153,.35),0_0_12px_rgba(236,72,153,.6)]'
            : manhole.hasLegendary
              ? 'ring-2 ring-amber-400 shadow-[0_0_0_3px_rgba(245,158,11,.35),0_0_12px_rgba(245,158,11,.55)]'
              : ''}

          <a
            href={`/?focus=${manhole.manholeNo}`}
            class="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
          >
            <!-- Cover image -->
            <div class="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-700 {ringClass}">
              {#if manhole.pictureUrl}
                <img
                  src={PIC_BASE + manhole.pictureUrl}
                  alt={manhole.name}
                  class="h-full w-full object-contain transition group-hover:scale-105"
                  loading="lazy"
                  onerror={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
                />
              {/if}

              <!-- Visited overlay -->
              {#if isVisited}
                <div class="absolute inset-0 flex items-center justify-center bg-green-600/20">
                  <span class="rounded-full bg-green-600 px-2 py-0.5 text-xs font-bold text-white shadow">
                    ✓
                  </span>
                </div>
              {/if}
            </div>

            <!-- Card body -->
            <div class="flex flex-1 flex-col gap-1 p-2">
              <p class="truncate text-xs font-bold leading-snug text-slate-800 dark:text-slate-100">
                {manhole.name}
              </p>
              <p class="text-[10px] font-semibold text-rose-500">
                #{manhole.manholeNo}
              </p>

              <!-- Pokémon sprites (first MAX_SPRITES) -->
              {#if manhole.pokemonNames.length}
                <div class="mt-1 flex gap-0.5">
                  {#each manhole.pokemonNames.slice(0, MAX_SPRITES) as pokemonName (pokemonName)}
                    <img
                      src={spriteUrl(pokemonName)}
                      alt={pokemonName}
                      title={pokemonName}
                      class="h-6 w-6 object-contain"
                      style="image-rendering: pixelated;"
                      loading="lazy"
                      onerror={(e) => ((e.currentTarget as HTMLImageElement).style.visibility = 'hidden')}
                    />
                  {/each}
                  {#if manhole.pokemonNames.length > MAX_SPRITES}
                    <span class="self-center text-[9px] font-bold text-slate-400">
                      +{manhole.pokemonNames.length - MAX_SPRITES}
                    </span>
                  {/if}
                </div>
              {/if}
            </div>
          </a>
        {/each}
      </div>
    {/if}

  </div>
</div>
