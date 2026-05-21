<script lang="ts">
  import { goto } from '$app/navigation';
  import { createQuery } from '@tanstack/svelte-query';
  import type { AchievementCategory } from '@dexkepo/shared';
  import { auth } from '$lib/stores/auth';
  import { t } from '$lib/i18n/locale';
  import { listDex } from '$lib/api/dex';
  import { listManholes } from '$lib/api/manholes';
  import { listAchievements } from '$lib/api/achievements';
  import { getFavorites } from '$lib/api/favorites';
  import AchievementBadge from '$lib/components/AchievementBadge.svelte';
  import FavoritePokemon from '$lib/components/FavoritePokemon.svelte';
  import AchievementsGridSkeleton from '$lib/components/skeletons/AchievementsGridSkeleton.svelte';
  import RecentVisitsSkeleton from '$lib/components/skeletons/RecentVisitsSkeleton.svelte';
  import PublicProfileCard from '$lib/components/me/PublicProfileCard.svelte';
  import ChosenFavoritePicker from '$lib/components/me/ChosenFavoritePicker.svelte';
  import { useQueryClient } from '@tanstack/svelte-query';

  const queryClient = useQueryClient();

  $effect(() => {
    if (!$auth) {
      goto('/login');
    }
  });

  const dexQ = createQuery({
    queryKey: ['dex'],
    queryFn: listDex,
    enabled: !!$auth,
  });
  const manholesQ = createQuery({
    queryKey: ['manholes'],
    queryFn: () => listManholes(),
  });
  const achievementsQ = createQuery({
    queryKey: ['achievements'],
    queryFn: listAchievements,
    enabled: !!$auth,
  });
  const favoritesQ = createQuery({
    queryKey: ['favorites'],
    queryFn: getFavorites,
    enabled: !!$auth,
  });

  const total = $derived($manholesQ.data?.length ?? 0);
  const visited = $derived($dexQ.data ?? []);
  const achievements = $derived($achievementsQ.data ?? []);

  const completion = $derived.by(() => {
    if (!total) {
      return 0;
    }

    return (visited.length / total) * 100;
  });

  const categoryLabels = $derived<Record<AchievementCategory, string>>({
    count: $t('me.categories.count'),
    geo: $t('me.categories.geo'),
    time: $t('me.categories.time'),
    type: $t('me.categories.type'),
  });

  const categories: AchievementCategory[] = ['count', 'geo', 'time', 'type'];

  function byCategory(cat: AchievementCategory) {
    return achievements.filter((achievement) => achievement.category === cat);
  }
</script>

{#if $auth}
  <!-- `<main>` is overflow-hidden so the map page can fill it exactly.
       Routes that need to scroll opt in with their own overflow-y-auto + h-full. -->
  <div class="h-full overflow-y-auto">
    <div class="mx-auto mt-6 w-full max-w-4xl space-y-6 p-4 pb-12">
    <!-- Hero -->
    <header class="rounded-3xl bg-gradient-to-br from-rose-500 via-red-500 to-orange-500 p-6 text-white shadow-lg">
      <p class="text-xs font-bold uppercase tracking-[.25em] text-white/85">{$t('me.trainerKicker')}</p>
      <h1 class="mt-1 text-3xl font-extrabold">{$auth.user.pseudo}</h1>
      <p class="text-sm text-white/80">{$auth.user.email}</p>

      <div class="mt-5 flex items-end gap-3">
        <div>
          <p class="text-[10px] font-bold uppercase tracking-widest text-white/70">{$t('me.progress')}</p>
          <p class="text-4xl font-extrabold tabular-nums">
            {visited.length}<span class="text-2xl text-white/70"> / {total}</span>
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
    </header>

    <PublicProfileCard />

    <!-- Favourite Pokémon -->
    <FavoritePokemon data={$favoritesQ.data} loading={$favoritesQ.isLoading} />

    {#if $favoritesQ.data?.completedAll && $manholesQ.data}
      <ChosenFavoritePicker
        manholes={$manholesQ.data}
        onChange={() => queryClient.invalidateQueries({ queryKey: ['favorites'] })}
      />
    {/if}

    <!-- Achievements -->
    <section>
      <div class="flex items-baseline justify-between">
        <h2 class="text-lg font-extrabold tracking-tight text-slate-900 dark:text-slate-100">{$t('me.achievements')}</h2>
        <p class="text-sm tabular-nums text-slate-500">
          {achievements.filter((achievement) => achievement.unlocked).length} / {achievements.length}
        </p>
      </div>

      {#if $achievementsQ.isLoading}
        <AchievementsGridSkeleton />
      {:else}
        {#each categories as category}
          {@const items = byCategory(category)}
          {#if items.length}
            <div class="mt-4">
              <p class="text-[10px] font-bold uppercase tracking-[.25em] text-slate-500">
                {categoryLabels[category]}
              </p>
              <div class="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                {#each items as achievement (achievement.id)}
                  <AchievementBadge achievement={achievement} />
                {/each}
              </div>
            </div>
          {/if}
        {/each}
      {/if}
    </section>

    <!-- Recent visits -->
    <section>
      <h2 class="text-lg font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
        {$t('me.recentVisits')}
        <span class="ml-1 text-sm font-medium text-slate-500">({visited.length})</span>
      </h2>

      {#if $dexQ.isLoading}
        <RecentVisitsSkeleton />
      {:else if visited.length === 0}
        <p class="mt-2 text-sm text-slate-500">
          {$t('me.noVisits')}
        </p>
      {:else}
        <ul class="mt-2 divide-y divide-slate-200 overflow-hidden rounded-2xl bg-white shadow-sm dark:divide-slate-700 dark:bg-slate-800">
          {#each visited.slice(0, 25) as entry}
            <li class="flex items-center gap-3 p-3 text-sm">
              {#if entry.manhole.pictureUrl}
                <img
                  src={`https://local.pokemon.jp${entry.manhole.pictureUrl}`}
                  alt={entry.manhole.name}
                  class="h-12 w-12 flex-shrink-0 rounded-lg object-cover ring-1 ring-slate-200"
                  loading="lazy"
                />
              {/if}
              <div class="min-w-0 flex-1">
                <p class="truncate font-semibold text-slate-900 dark:text-slate-100">
                  #{entry.manholeNo} · {entry.manhole.name}
                </p>
                <p class="truncate text-xs text-slate-500">
                  {entry.manhole.prefName}{entry.manhole.city ? ` · ${entry.manhole.city}` : ''}
                </p>
              </div>
              <span class="text-[11px] tabular-nums text-slate-400">
                {new Date(entry.visitedAt).toLocaleDateString()}
              </span>
            </li>
          {/each}
        </ul>
        {#if visited.length > 25}
          <p class="mt-2 text-xs text-slate-500">
            {$t('me.showingNRecent')}
          </p>
        {/if}
      {/if}
    </section>
    </div>
  </div>
{/if}
