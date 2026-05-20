<script lang="ts">
  import Skeleton from './Skeleton.svelte';
  import FavoritesPodiumSkeleton from './FavoritesPodiumSkeleton.svelte';
  import AchievementsGridSkeleton from './AchievementsGridSkeleton.svelte';
</script>

<!-- Hero placeholder — matches TrainerHero shape -->
<header class="rounded-3xl bg-gradient-to-br from-rose-500 via-red-500 to-orange-500 p-6 text-white shadow-lg">
  <Skeleton class="h-3 w-20 bg-white/30 dark:bg-white/30" />
  <Skeleton class="mt-2 h-8 w-48 bg-white/30 dark:bg-white/30" />
  <Skeleton class="mt-2 h-3 w-32 bg-white/30 dark:bg-white/30" />

  <div class="mt-5 flex items-end gap-3">
    <div class="flex-1 space-y-2">
      <Skeleton class="h-2 w-16 bg-white/30 dark:bg-white/30" />
      <Skeleton class="h-10 w-32 bg-white/30 dark:bg-white/30" />
    </div>
    <Skeleton class="h-6 w-16 bg-white/30 dark:bg-white/30" />
  </div>

  <Skeleton class="mt-2 h-2 w-full bg-white/25 dark:bg-white/25" />
</header>

<!-- Favourites placeholder -->
<section
  class="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200
         dark:bg-slate-900 dark:ring-slate-700"
>
  <Skeleton class="h-3 w-40" />
  <FavoritesPodiumSkeleton />
</section>

<!-- Achievements placeholder -->
<section>
  <div class="flex items-baseline justify-between">
    <Skeleton class="h-5 w-32" />
    <Skeleton class="h-3 w-16" />
  </div>
  <AchievementsGridSkeleton />
</section>
