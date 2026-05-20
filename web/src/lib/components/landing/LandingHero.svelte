<!-- web/src/lib/components/landing/LandingHero.svelte -->
<script lang="ts">
  import { auth } from '$lib/stores/auth';
</script>

<section
  class="relative flex h-dvh w-full flex-col items-center justify-center gap-6 overflow-hidden
         bg-gradient-to-br from-rose-500 via-red-500 to-orange-500 px-4 text-center text-white"
>
  <!-- Soft radial highlight behind the content -->
  <div
    aria-hidden="true"
    class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,.18),transparent_60%)]"
  ></div>

  <!-- Pokéball logo (CSS-shape, scaled-up version of Header.svelte's) -->
  <span
    class="relative inline-block h-20 w-20 overflow-hidden rounded-full bg-white shadow-2xl ring-4 ring-white/60"
    aria-hidden="true"
  >
    <span class="absolute inset-x-0 top-0 h-1/2 bg-red-600"></span>
    <span class="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 bg-slate-900"></span>
    <span
      class="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white ring-[3px] ring-slate-900"
    ></span>
  </span>

  <div class="relative max-w-3xl">
    <h1 class="text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
      Find every Pokémon manhole cover in Japan.
    </h1>
    <p class="mt-4 text-base text-white/90 md:text-lg">
      470 hand-painted poké-fúta. One personal dex. Track what you've visited.
    </p>
  </div>

  <div class="relative mt-2 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
    <a
      href="#map"
      class="rounded-full bg-white px-6 py-3 text-sm font-bold text-rose-600 shadow-lg transition hover:scale-105 hover:bg-rose-50"
    >
      Open the map ↓
    </a>
    {#if !$auth}
      <a
        href="/register"
        class="rounded-full border-2 border-white/80 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/15"
      >
        Sign up — track your dex
      </a>
    {/if}
  </div>

  <!-- Bouncing scroll cue, anchored to the bottom of the hero -->
  <a
    href="#map"
    class="absolute bottom-6 text-white/80 transition hover:text-white"
    aria-label="Scroll to map"
  >
    <svg viewBox="0 0 24 24" class="h-8 w-8 animate-bounce" fill="currentColor" aria-hidden="true">
      <path d="M12 16l-6-6h12l-6 6z" />
    </svg>
  </a>
</section>
