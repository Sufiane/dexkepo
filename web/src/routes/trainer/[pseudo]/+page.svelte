<script lang="ts">
  import { page } from '$app/stores';
  import { createQuery } from '@tanstack/svelte-query';
  import type { AchievementCategory } from '@dexkepo/shared';
  import { getTrainer } from '$lib/api/trainers';
  import { t } from '$lib/i18n/locale';
  import TrainerHero from '$lib/components/trainer/TrainerHero.svelte';
  import TrainerNotFound from '$lib/components/trainer/TrainerNotFound.svelte';
  import AchievementBadge from '$lib/components/AchievementBadge.svelte';
  import FavoritePokemon from '$lib/components/FavoritePokemon.svelte';
  import TrainerProfileSkeleton from '$lib/components/skeletons/TrainerProfileSkeleton.svelte';

  const pseudo = $derived($page.params.pseudo ?? '');

  const profileQ = createQuery({
    queryKey: ['trainer', pseudo],
    queryFn: () => getTrainer(pseudo),
    retry: false,
  });

  const categoryLabels = $derived<Record<AchievementCategory, string>>({
    count: $t('me.categories.count'),
    geo: $t('me.categories.geo'),
    time: $t('me.categories.time'),
    type: $t('me.categories.type'),
  });

  const categories: AchievementCategory[] = ['count', 'geo', 'time', 'type'];

  function byCategory(cat: AchievementCategory) {
    return ($profileQ.data?.achievements ?? []).filter(
      (achievement) => achievement.category === cat,
    );
  }
</script>

<div class="h-full overflow-y-auto">
  <div class="mx-auto mt-6 w-full max-w-4xl space-y-6 p-4 pb-12">
    {#if $profileQ.isLoading}
      <TrainerProfileSkeleton />
    {:else if $profileQ.isError}
      <TrainerNotFound />
    {:else if $profileQ.data}
      {@const profile = $profileQ.data}
      <TrainerHero
        pseudo={profile.pseudo}
        memberSince={profile.memberSince}
        visitedCount={profile.visitedCount}
        totalCount={profile.totalCount}
      />

      <FavoritePokemon
        data={{
          favorites: profile.favorites,
          completedAll: profile.completedAll,
          chosenFavorite: null,
        }}
        loading={false}
      />

      <section>
        <div class="flex items-baseline justify-between">
          <h2 class="text-lg font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            {$t('me.achievements')}
          </h2>
          <p class="text-sm tabular-nums text-slate-500">
            {$t('trainer.unlockedCount', { count: profile.achievements.length })}
          </p>
        </div>

        {#each categories as category}
          {@const items = byCategory(category)}
          {#if items.length}
            <div class="mt-4">
              <p class="text-[10px] font-bold uppercase tracking-[.25em] text-slate-500">
                {categoryLabels[category]}
              </p>
              <div class="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                {#each items as achievement (achievement.id)}
                  <AchievementBadge
                    achievement={{
                      ...achievement,
                      icon: '🏅',
                      unlocked: true,
                    }}
                  />
                {/each}
              </div>
            </div>
          {/if}
        {/each}
      </section>
    {/if}
  </div>
</div>
