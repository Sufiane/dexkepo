<script lang="ts">
  import { goto } from '$app/navigation';
  import { createQuery } from '@tanstack/svelte-query';
  import { auth } from '$lib/stores/auth';
  import { listDex } from '$lib/api/dex';
  import { listManholes } from '$lib/api/manholes';

  $effect(() => {
    if (!$auth) goto('/login');
  });

  const dexQ = createQuery({ queryKey: ['dex'], queryFn: listDex, enabled: !!$auth });
  const manholesQ = createQuery({ queryKey: ['manholes'], queryFn: listManholes });

  const total = $derived($manholesQ.data?.length ?? 0);
  const visited = $derived($dexQ.data ?? []);
</script>

{#if $auth}
  <div class="mx-auto mt-8 w-full max-w-2xl p-4">
    <header class="rounded-2xl bg-white p-5 shadow">
      <h1 class="text-2xl font-bold">{$auth.user.pseudo}</h1>
      <p class="text-sm text-slate-600">{$auth.user.email}</p>
      <p class="mt-3 text-lg">
        <span class="font-semibold tabular-nums">{visited.length}</span>
        <span class="text-slate-500"> / {total} covers visited</span>
      </p>
      <div class="mt-2 h-2 w-full overflow-hidden rounded bg-slate-100">
        <div class="h-full bg-green-600"
             style="width: {total ? (visited.length / total * 100).toFixed(1) : 0}%"></div>
      </div>
    </header>

    <section class="mt-6">
      <h2 class="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-600">
        Visited ({visited.length})
      </h2>
      {#if $dexQ.isLoading}
        <p class="text-sm text-slate-500">Loading…</p>
      {:else if visited.length === 0}
        <p class="text-sm text-slate-500">No visits yet. Open the map and mark some!</p>
      {:else}
        <ul class="divide-y divide-slate-200 rounded-2xl bg-white shadow">
          {#each visited as e}
            <li class="flex items-center justify-between gap-3 p-3 text-sm">
              <div>
                <p class="font-medium">#{e.manholeNo} · {e.manhole.name}</p>
                <p class="text-xs text-slate-500">{e.manhole.prefName}{e.manhole.city ? ` · ${e.manhole.city}` : ''}</p>
              </div>
              <span class="text-xs text-slate-400">{new Date(e.visitedAt).toLocaleDateString()}</span>
            </li>
          {/each}
        </ul>
      {/if}
    </section>
  </div>
{/if}
