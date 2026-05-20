<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import confetti from 'canvas-confetti';
  import { auth } from '../stores/auth';
  import { markVisited, unmarkVisited } from '../api/dex';
  import { getManhole } from '../api/manholes';
  import { spriteUrl } from '../utils/pokemonSprite';

  const PIC_BASE = 'https://local.pokemon.jp';

  type Props = {
    manholeNo: string;
    name: string;
    prefEnName: string;
    pictureUrl: string;
    pokemonNames: string[];
    lat: number;
    lng: number;
    visited: boolean;
    onClose: () => void;
    onToggle: () => void;
  };

  let {
    manholeNo,
    name,
    prefEnName,
    pictureUrl,
    pokemonNames,
    lat,
    lng,
    visited,
    onClose,
    onToggle,
  }: Props = $props();

  // Google Maps "search" URL with raw coordinates — works on web + iOS/Android
  // apps via the universal `maps.google.com` deep-link handler. User lands on
  // a pin and can tap "Directions" from there.
  const gmapsHref = $derived(
    `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
  );

  const detailQ = createQuery({
    queryKey: ['manhole', manholeNo],
    queryFn: () => getManhole(manholeNo),
    staleTime: 5 * 60_000,
  });

  let busy = $state(false);
  let error: string | null = $state(null);
  let lightboxOpen = $state(false);
  let buttonEl: HTMLButtonElement | null = $state(null);

  function fireConfetti(): void {
    if (!buttonEl) {
      return;
    }

    const rect = buttonEl.getBoundingClientRect();
    const origin = {
      x: (rect.left + rect.width / 2) / window.innerWidth,
      y: (rect.top + rect.height / 2) / window.innerHeight,
    };

    confetti({
      particleCount: 80,
      spread: 70,
      startVelocity: 35,
      origin,
      colors: ['#16a34a', '#22c55e', '#fde047', '#f97316', '#ef4444'],
      scalar: 0.9,
    });
  }

  async function toggle(): Promise<void> {
    if (!$auth) {
      return;
    }

    busy = true;
    error = null;

    try {
      if (visited) {
        await unmarkVisited(manholeNo);
      } else {
        await markVisited(manholeNo);
        fireConfetti();
      }

      onToggle();
    } catch (err) {
      error = (err as Error).message;
    } finally {
      busy = false;
    }
  }
</script>

<div
  class="dx-panel fixed bottom-0 left-0 right-0 z-[1000] max-h-[75vh] overflow-y-auto rounded-t-2xl bg-white p-4 shadow-2xl
         md:bottom-auto md:left-auto md:right-4 md:top-20 md:max-h-[80vh] md:w-[28rem] md:rounded-2xl
         dark:bg-slate-900 dark:text-slate-100 dark:ring-1 dark:ring-slate-700"
>
  <div class="flex items-start justify-between gap-3">
    <div class="flex-1">
      <p class="text-xs font-bold uppercase tracking-widest text-rose-500">
        #{manholeNo}
        <span class="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          {prefEnName}
        </span>
      </p>
      <h2 class="mt-1 text-xl font-extrabold leading-tight text-slate-900 dark:text-white">
        {name}
      </h2>
      {#if $detailQ.data?.city}
        <p class="text-sm text-slate-600">{$detailQ.data.city}</p>
      {/if}
    </div>
    <button
      class="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
      onclick={onClose}
      aria-label="close"
    >
      <svg viewBox="0 0 20 20" class="h-5 w-5" fill="currentColor">
        <path d="M5.28 4.22a.75.75 0 00-1.06 1.06L8.94 10l-4.72 4.72a.75.75 0 101.06 1.06L10 11.06l4.72 4.72a.75.75 0 101.06-1.06L11.06 10l4.72-4.72a.75.75 0 00-1.06-1.06L10 8.94 5.28 4.22z" />
      </svg>
    </button>
  </div>

  {#if pictureUrl}
    <button
      type="button"
      onclick={() => (lightboxOpen = true)}
      class="mt-3 block w-full overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200 transition hover:ring-rose-300"
      aria-label="View cover full-size"
    >
      <img
        src={PIC_BASE + pictureUrl}
        alt={name}
        class="aspect-square w-full object-contain"
        onerror={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
      />
    </button>
  {/if}

  <!-- Pokemon featured: each as sprite + name chip -->
  {#if pokemonNames.length}
    <div class="mt-4">
      <p class="text-[10px] font-bold uppercase tracking-widest text-slate-500">
        Featured Pokémon
      </p>
      <ul class="mt-2 flex flex-wrap gap-2">
        {#each pokemonNames as pokemonName}
          <li
            class="flex items-center gap-1.5 rounded-full bg-slate-100 py-1 pl-1 pr-3 text-sm font-medium text-slate-800 dark:bg-slate-800 dark:text-slate-200"
          >
            <img
              src={spriteUrl(pokemonName)}
              alt=""
              class="h-7 w-7 object-contain"
              loading="lazy"
              style="image-rendering: pixelated;"
              onerror={(e) => ((e.currentTarget as HTMLImageElement).style.visibility = 'hidden')}
            />
            <span>{pokemonName}</span>
          </li>
        {/each}
      </ul>
    </div>
  {/if}

  {#if $detailQ.isLoading}
    <p class="mt-3 text-sm text-slate-500">Loading details…</p>
  {:else if $detailQ.isError}
    <p class="mt-3 text-sm text-red-600">Failed to load: {($detailQ.error as Error).message}</p>
  {:else if $detailQ.data?.address}
    <p class="mt-3 text-sm text-slate-600">
      <span class="font-semibold text-slate-500">📍</span>
      {$detailQ.data.address}
    </p>
  {/if}

  <a
    href={gmapsHref}
    target="_blank"
    rel="noopener noreferrer"
    class="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:border-rose-300 hover:text-rose-600"
  >
    <!-- Tiny pin glyph; the external-link arrow signals "opens in a new tab" -->
    <svg viewBox="0 0 20 20" class="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path fill-rule="evenodd" d="M10 18s7-6.343 7-11A7 7 0 003 7c0 4.657 7 11 7 11zm0-8a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
    </svg>
    Open in Google Maps
    <svg viewBox="0 0 20 20" class="h-3 w-3" fill="currentColor" aria-hidden="true">
      <path d="M11 3a1 1 0 100 2h2.586L7.293 11.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
      <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
    </svg>
  </a>

  <div class="mt-5">
    {#if $auth}
      <button
        bind:this={buttonEl}
        class="dx-mark-btn flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white shadow-md transition-all disabled:opacity-60"
        class:bg-slate-600={visited}
        class:bg-green-600={!visited}
        class:hover:bg-slate-700={visited}
        class:hover:bg-green-700={!visited}
        disabled={busy}
        onclick={toggle}
      >
        {#if busy}
          <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
        {:else if visited}
          ✓ Visited — tap to unmark
        {:else}
          Mark as visited
        {/if}
      </button>
      {#if error}
        <p class="mt-2 text-xs text-red-600">{error}</p>
      {/if}
    {:else}
      <a
        href="/register"
        class="block w-full rounded-xl bg-slate-900 px-4 py-3 text-center text-sm font-bold text-white shadow-md hover:bg-slate-800"
      >
        Sign up to track your dex
      </a>
    {/if}
  </div>
</div>

{#if lightboxOpen && pictureUrl}
  <button
    type="button"
    class="fixed inset-0 z-[2000] flex items-center justify-center bg-black/85 p-4"
    onclick={() => (lightboxOpen = false)}
    aria-label="Close image"
  >
    <img
      src={PIC_BASE + pictureUrl}
      alt={name}
      class="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
    />
  </button>
{/if}
