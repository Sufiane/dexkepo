<script lang="ts">
  import Skeleton from './Skeleton.svelte';
</script>

<div class="mt-3 grid grid-cols-3 gap-3">
  {#each [0, 1, 2] as index (index)}
    <div class="flex flex-col items-center rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
      <Skeleton class="h-3 w-6" />
      <Skeleton class="mt-2 h-16 w-16 rounded-full" />
      <Skeleton class="mt-2 h-3 w-3/4" />
      <Skeleton class="mt-1 h-2 w-1/2" />
    </div>
  {/each}
</div>
