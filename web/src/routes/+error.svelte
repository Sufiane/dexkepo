<script lang="ts">
  import { page } from '$app/stores';
  import { spriteUrl } from '$lib/utils/pokemonSprite';

  const status = $derived($page.status);
  const message = $derived($page.error?.message ?? 'Something went wrong');
  const is404 = $derived(status === 404);

  // Psyduck for 404 (confused, lost). Voltorb for other errors (boom).
  const mascot = $derived(is404 ? 'Psyduck' : 'Voltorb');
  const mascotUrl = $derived(spriteUrl(mascot));

  const headline = $derived(is404 ? "It's not very effective…" : 'Critical hit!');
  const subline = $derived(
    is404
      ? `Wild ${mascot} blocks your path. There's nothing on this route.`
      : message,
  );
</script>

<div class="flex h-full items-center justify-center p-4">
  <div
    class="relative w-full max-w-lg overflow-hidden rounded-3xl bg-gradient-to-br
           from-rose-500 via-red-500 to-orange-500 p-1 shadow-2xl"
  >
    <!-- Pokédex-style frame -->
    <div class="rounded-[20px] bg-slate-50 p-6 dark:bg-slate-900">
      <!-- Status pill -->
      <div class="flex items-center justify-between">
        <span
          class="rounded-full bg-slate-900 px-3 py-1 text-[10px] font-bold uppercase
                 tracking-[.25em] text-white dark:bg-slate-100 dark:text-slate-900"
        >
          Route {status}
        </span>
        <div class="flex gap-1.5">
          <span class="h-2.5 w-2.5 rounded-full bg-rose-500 shadow-inner"></span>
          <span class="h-2.5 w-2.5 rounded-full bg-amber-400"></span>
          <span class="h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
        </div>
      </div>

      <!-- Mascot stage -->
      <div
        class="mt-5 flex h-48 items-end justify-center rounded-2xl
               bg-gradient-to-b from-sky-200 to-emerald-200 px-4 pb-2
               dark:from-slate-700 dark:to-slate-800"
      >
        <img
          src={mascotUrl}
          alt={mascot}
          class="dx-404-bob h-40 w-40 object-contain"
          style="image-rendering: pixelated;"
        />
      </div>

      <!-- Dialog box (game-style) -->
      <div
        class="mt-4 rounded-xl border-2 border-slate-900 bg-white p-4 shadow-sm
               dark:border-slate-100 dark:bg-slate-800"
      >
        <p class="text-xs font-bold uppercase tracking-[.2em] text-rose-500">
          {headline}
        </p>
        <p class="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
          {subline}
        </p>
      </div>

      <!-- CTAs -->
      <div class="mt-4 flex flex-wrap gap-2">
        <a
          href="/"
          class="flex-1 rounded-full bg-rose-500 px-5 py-2.5 text-center text-sm
                 font-bold text-white shadow hover:bg-rose-600"
        >
          Back to the map
        </a>
        <button
          type="button"
          onclick={() => history.back()}
          class="rounded-full bg-slate-200 px-5 py-2.5 text-sm font-bold
                 text-slate-900 hover:bg-slate-300 dark:bg-slate-700
                 dark:text-slate-100 dark:hover:bg-slate-600"
        >
          ← Run
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  /* Gentle bob — gives the sprite some life without being noisy. */
  :global(.dx-404-bob) {
    animation: dx-404-bob 2.4s ease-in-out infinite;
  }
  @keyframes dx-404-bob {
    0%, 100% { transform: translateY(0); }
    50%      { transform: translateY(-6px); }
  }
  @media (prefers-reduced-motion: reduce) {
    :global(.dx-404-bob) {
      animation: none;
    }
  }
</style>
