<script lang="ts">
  import Skeleton from './Skeleton.svelte';

  // 8 placeholder badges in the same grid as AchievementBadge.
  const placeholders = Array.from({ length: 8 });
</script>

<div class="mt-4">
  <Skeleton class="h-3 w-24" />
  <div class="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
    {#each placeholders as _, index (index)}
      <div class="rounded-2xl bg-white p-3 ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
        <Skeleton class="mx-auto h-10 w-10 rounded-full" />
        <Skeleton class="mx-auto mt-2 h-3 w-3/4" />
        <Skeleton class="mx-auto mt-1 h-2 w-1/2" />
      </div>
    {/each}
  </div>
</div>
