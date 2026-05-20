<script lang="ts">
  import Skeleton from './Skeleton.svelte';

  const placeholders = Array.from({ length: 5 });
</script>

<ul class="mt-2 divide-y divide-slate-200 overflow-hidden rounded-2xl bg-white shadow-sm dark:divide-slate-700 dark:bg-slate-800">
  {#each placeholders as _, index (index)}
    <li class="flex items-center gap-3 p-3">
      <Skeleton class="h-12 w-12 flex-shrink-0 rounded-lg" />
      <div class="min-w-0 flex-1 space-y-2">
        <Skeleton class="h-3 w-3/4" />
        <Skeleton class="h-2 w-1/2" />
      </div>
      <Skeleton class="h-2 w-12" />
    </li>
  {/each}
</ul>
