<script lang="ts">
  import type { Manhole } from '@dexkepo/shared';
  import { auth } from '../stores/auth';
  import { markVisited, unmarkVisited } from '../api/dex';

  const PIC_BASE = 'https://local.pokemon.co.jp';

  type Props = {
    manhole: Manhole;
    visited: boolean;
    onClose: () => void;
    onToggle: () => void; // called after a successful mark/unmark
  };

  let { manhole, visited, onClose, onToggle }: Props = $props();
  let busy = $state(false);
  let error: string | null = $state(null);

  async function toggle() {
    if (!$auth) return;
    busy = true;
    error = null;
    try {
      if (visited) await unmarkVisited(manhole.manholeNo);
      else await markVisited(manhole.manholeNo);
      onToggle();
    } catch (e) {
      error = (e as Error).message;
    } finally {
      busy = false;
    }
  }
</script>

<div
  class="fixed bottom-0 left-0 right-0 z-[1000] max-h-[70vh] overflow-y-auto rounded-t-2xl bg-white p-4 shadow-2xl
         md:bottom-auto md:left-auto md:right-4 md:top-20 md:max-h-[80vh] md:w-96 md:rounded-2xl"
>
  <div class="flex items-start justify-between">
    <div>
      <h2 class="text-lg font-bold">#{manhole.manholeNo} · {manhole.name}</h2>
      <p class="text-sm text-slate-600">{manhole.prefName}{manhole.city ? ` · ${manhole.city}` : ''}</p>
    </div>
    <button class="text-slate-500 hover:text-slate-800" onclick={onClose} aria-label="close">✕</button>
  </div>

  {#if manhole.pictureUrl}
    <img
      src={PIC_BASE + manhole.pictureUrl}
      alt={manhole.name}
      class="mt-3 w-full rounded-lg bg-slate-100 object-contain"
      onerror={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
    />
  {/if}

  {#if manhole.address}
    <p class="mt-2 text-sm text-slate-700">{manhole.address}</p>
  {/if}

  <div class="mt-3">
    <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Pokemon</p>
    <ul class="mt-1 flex flex-wrap gap-1">
      {#each manhole.pokemon ?? [] as p}
        <li class="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{p.name}</li>
      {/each}
    </ul>
  </div>

  <div class="mt-4">
    {#if $auth}
      <button
        class="w-full rounded-lg px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
        class:bg-slate-700={visited}
        class:bg-green-600={!visited}
        disabled={busy}
        onclick={toggle}
      >
        {busy ? '...' : visited ? 'Unmark visited' : 'Mark as visited'}
      </button>
      {#if error}
        <p class="mt-1 text-xs text-red-600">{error}</p>
      {/if}
    {:else}
      <a
        href="/register"
        class="block w-full rounded-lg bg-slate-900 px-3 py-2 text-center text-sm font-semibold text-white"
      >Sign up to track your dex</a>
    {/if}
  </div>
</div>
