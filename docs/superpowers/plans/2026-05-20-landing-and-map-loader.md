# Landing Page + Map Loader Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn `/` from a "drops you straight onto the map" page into a multi-section scrolling landing (hero → features → how-it-works → map → footer) and replace the bare "Loading map…" string with a branded spinning-Pokéball loader while the FilterBar stays visible.

**Architecture:** `+page.svelte` becomes a thin orchestrator wrapped in an `overflow-y-auto` div (same opt-in-scroll pattern `/me` already uses; `<main>` stays `overflow-hidden`). Each section is a focused Svelte component under `web/src/lib/components/landing/`. `MapSection` owns all map-related state and queries — that logic is *moved*, not rewritten. `Map.svelte`, `FilterBar.svelte`, `ManholePanel.svelte`, all stores, all api clients are untouched.

**Tech Stack:** SvelteKit 2 (Svelte 5 runes) · TypeScript · Tailwind CSS · `@tanstack/svelte-query` (already wired) · Leaflet (already wired). No new dependencies.

**Verification model:** the `web` workspace has no unit-test runner installed, so each task verifies via `npm --workspace web run check` (svelte-check) + `npm --workspace web run build` + a visual smoke at the end. Adding a test runner is explicitly out of scope.

---

## File Structure

| Path | Status | Responsibility |
|---|---|---|
| `web/src/app.css` | modify | Add pokéball spin + breathe + reduced-motion keyframes; `html { scroll-behavior: smooth; }` |
| `web/src/lib/components/landing/LandingHero.svelte` | new | Full-viewport hero w/ logo, headline, two CTAs, scroll cue |
| `web/src/lib/components/landing/LandingFeatures.svelte` | new | 3 feature cards in a responsive grid |
| `web/src/lib/components/landing/LandingHowItWorks.svelte` | new | 3 numbered steps |
| `web/src/lib/components/landing/MapLoader.svelte` | new | Spinning Pokéball SVG + caption (used inside MapSection) |
| `web/src/lib/components/landing/MapError.svelte` | new | Error message + retry button (used inside MapSection) |
| `web/src/lib/components/landing/MapSection.svelte` | new | Takes over current `+page.svelte` body — queries, filters, marker pop, panel, loading guard |
| `web/src/lib/components/landing/SiteFooter.svelte` | new | Copyright + attribution |
| `web/src/routes/+page.svelte` | rewrite | Thin orchestrator inside an `overflow-y-auto` scroll wrapper |

`+layout.svelte`, `Header.svelte`, `Map.svelte`, `FilterBar.svelte`, `ManholePanel.svelte`, all stores, all api clients — **untouched**.

---

## Task 1: CSS prerequisites — keyframes & smooth scroll

**Files:**
- Modify: `web/src/app.css`

- [ ] **Step 1: Append the keyframes + smooth-scroll rule**

Open `web/src/app.css` and append the following block at the very end of the file (do not delete anything that's already there):

```css
/* --- Landing-page scroll smoothness ------------------------------------- */
html {
  scroll-behavior: smooth;
}

/* --- Pokéball loader animations ---------------------------------------- */
@keyframes dx-pokeball-spin {
  to { transform: rotate(360deg); }
}
@keyframes dx-pokeball-breathe {
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.04); }
}
@keyframes dx-pokeball-pulse {
  0%, 100% { opacity: 0.55; }
  50%      { opacity: 1; }
}

.dx-pokeball-spin {
  animation: dx-pokeball-spin 1.4s linear infinite;
  transform-origin: 50% 50%;
}
.dx-pokeball-breathe {
  animation: dx-pokeball-breathe 2s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  .dx-pokeball-spin,
  .dx-pokeball-breathe {
    animation: dx-pokeball-pulse 2s ease-in-out infinite;
    transform: none !important;
  }
}
```

- [ ] **Step 2: Verify svelte-check still passes**

Run from repo root:

```bash
npm --workspace web run check
```

Expected: `COMPLETED ... 0 ERRORS` (warnings already present are fine).

- [ ] **Step 3: Commit**

```bash
git add web/src/app.css
git commit -m "feat(web): pokéball loader keyframes + scroll-smooth"
```

---

## Task 2: MapLoader.svelte

The spinning-Pokéball component. A two-level animation: outer wrapper breathes (scale), inner wrapper spins (rotate). Both compose because they live on different DOM nodes.

**Files:**
- Create: `web/src/lib/components/landing/MapLoader.svelte`

- [ ] **Step 1: Create the file with full contents**

```svelte
<!-- web/src/lib/components/landing/MapLoader.svelte -->
<script lang="ts">
  // Pure presentation — no props. Centered absolutely so the parent only
  // needs `position: relative` for the loader to sit on top of (or replace)
  // the map. The two-level animation (breathe on the outer wrapper, spin on
  // the inner) composes the transforms cleanly without conflict.
</script>

<div
  role="status"
  aria-live="polite"
  class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-50 dark:bg-slate-900"
>
  <div class="dx-pokeball-breathe">
    <div class="dx-pokeball-spin">
      <svg viewBox="0 0 100 100" width="96" height="96" aria-hidden="true">
        <!-- Top half: red -->
        <path d="M 4 50 A 46 46 0 0 1 96 50 Z" fill="#dc2626" />
        <!-- Bottom half: white -->
        <path d="M 4 50 A 46 46 0 0 0 96 50 Z" fill="#ffffff" />
        <!-- Outer border + equator -->
        <circle cx="50" cy="50" r="46" fill="none" stroke="#0f172a" stroke-width="4" />
        <line x1="4" y1="50" x2="96" y2="50" stroke="#0f172a" stroke-width="4" />
        <!-- Centre button -->
        <circle cx="50" cy="50" r="13" fill="#ffffff" stroke="#0f172a" stroke-width="4" />
        <circle cx="50" cy="50" r="5" fill="#ffffff" stroke="#0f172a" stroke-width="2" />
      </svg>
    </div>
  </div>

  <p class="text-sm font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
    Catching pokémon covers…
  </p>
</div>
```

- [ ] **Step 2: Verify svelte-check passes**

Run:

```bash
npm --workspace web run check
```

Expected: `0 ERRORS`. The component isn't imported yet, so this only validates the file itself.

- [ ] **Step 3: Commit**

```bash
git add web/src/lib/components/landing/MapLoader.svelte
git commit -m "feat(web): MapLoader — spinning pokéball + caption"
```

---

## Task 3: MapError.svelte

Symmetrical to the loader: replaces today's inline error string with a retry-able error card. Takes two props.

**Files:**
- Create: `web/src/lib/components/landing/MapError.svelte`

- [ ] **Step 1: Create the file with full contents**

```svelte
<!-- web/src/lib/components/landing/MapError.svelte -->
<script lang="ts">
  type Props = {
    message: string;
    onRetry: () => void;
  };

  let { message, onRetry }: Props = $props();
</script>

<div
  role="alert"
  class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-50 p-4 text-center dark:bg-slate-900"
>
  <p class="text-base font-semibold text-red-600 dark:text-red-400">
    Couldn't load the map.
  </p>
  <p class="max-w-md text-sm text-slate-600 dark:text-slate-400">{message}</p>
  <button
    type="button"
    onclick={onRetry}
    class="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
  >
    Try again
  </button>
</div>
```

- [ ] **Step 2: Verify svelte-check passes**

```bash
npm --workspace web run check
```

Expected: `0 ERRORS`.

- [ ] **Step 3: Commit**

```bash
git add web/src/lib/components/landing/MapError.svelte
git commit -m "feat(web): MapError — friendly retry card"
```

---

## Task 4: SiteFooter.svelte

Two-line footer with attribution. Tiny.

**Files:**
- Create: `web/src/lib/components/landing/SiteFooter.svelte`

- [ ] **Step 1: Create the file with full contents**

```svelte
<!-- web/src/lib/components/landing/SiteFooter.svelte -->
<script lang="ts">
  // Pure presentation.
</script>

<footer
  class="border-t border-slate-200 bg-slate-100 px-4 py-6 text-center text-xs text-slate-600
         dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
>
  <p>
    dexkepo · personal Pokémon manhole-cover dex ·
    <a
      href="https://github.com/Sufiane/dexkepo"
      target="_blank"
      rel="noopener noreferrer"
      class="font-semibold text-slate-700 hover:underline dark:text-slate-200"
    >
      GitHub
    </a>
  </p>
  <p class="mt-1 text-[11px] text-slate-500 dark:text-slate-500">
    Manhole imagery © The Pokémon Company · Tiles © OpenStreetMap / CARTO · Sprites © Pokémon Showdown
  </p>
</footer>
```

- [ ] **Step 2: Verify svelte-check passes**

```bash
npm --workspace web run check
```

Expected: `0 ERRORS`.

- [ ] **Step 3: Commit**

```bash
git add web/src/lib/components/landing/SiteFooter.svelte
git commit -m "feat(web): SiteFooter with attribution"
```

---

## Task 5: LandingFeatures.svelte

Three feature cards in a responsive grid (1-col on mobile, 3-col on `md:`).

**Files:**
- Create: `web/src/lib/components/landing/LandingFeatures.svelte`

- [ ] **Step 1: Create the file with full contents**

```svelte
<!-- web/src/lib/components/landing/LandingFeatures.svelte -->
<script lang="ts">
  type Feature = {
    icon: string;
    title: string;
    pitch: string;
  };

  const features: Feature[] = [
    {
      icon: '🗾',
      title: 'Browse all 470',
      pitch: 'Filter the map by prefecture or Pokémon. Click a pin to see what cover lives there.',
    },
    {
      icon: '✅',
      title: 'Mark visits as you go',
      pitch: 'Sign up, tap a cover after you visit it in person, and watch your dex fill in.',
    },
    {
      icon: '🏆',
      title: 'Earn achievements',
      pitch: 'Streaks, region completions, legendaries spotted — bragging rights baked in.',
    },
  ];
</script>

<section class="border-t border-slate-200 bg-white py-16 dark:border-slate-800 dark:bg-slate-950">
  <div class="mx-auto max-w-5xl px-4">
    <h2 class="text-center text-xs font-bold uppercase tracking-[.3em] text-rose-500">
      What it does
    </h2>
    <p class="mt-2 text-center text-2xl font-extrabold text-slate-900 dark:text-slate-100">
      A real-world Pokédex of Japan's poké-fúta
    </p>

    <ul class="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
      {#each features as feature (feature.title)}
        <li
          class="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center transition hover:-translate-y-0.5 hover:shadow-md
                 dark:border-slate-700 dark:bg-slate-900"
        >
          <span class="text-4xl" aria-hidden="true">{feature.icon}</span>
          <h3 class="mt-3 text-lg font-bold text-slate-900 dark:text-slate-100">
            {feature.title}
          </h3>
          <p class="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            {feature.pitch}
          </p>
        </li>
      {/each}
    </ul>
  </div>
</section>
```

- [ ] **Step 2: Verify svelte-check passes**

```bash
npm --workspace web run check
```

Expected: `0 ERRORS`.

- [ ] **Step 3: Commit**

```bash
git add web/src/lib/components/landing/LandingFeatures.svelte
git commit -m "feat(web): LandingFeatures — 3 product cards"
```

---

## Task 6: LandingHowItWorks.svelte

Three numbered steps. Horizontal on `md:`, vertical on mobile.

**Files:**
- Create: `web/src/lib/components/landing/LandingHowItWorks.svelte`

- [ ] **Step 1: Create the file with full contents**

```svelte
<!-- web/src/lib/components/landing/LandingHowItWorks.svelte -->
<script lang="ts">
  type Step = {
    title: string;
    body: string;
  };

  const steps: Step[] = [
    {
      title: 'Find a cover',
      body: 'Open the map below, click any pin to see the Pokémon and address.',
    },
    {
      title: 'Visit it',
      body: 'Tap “Open in Google Maps” for directions. The real-world step.',
    },
    {
      title: 'Mark it',
      body: 'Once you’re back, tap “Mark as visited”. Confetti, green ring, profile updates.',
    },
  ];
</script>

<section class="border-t border-slate-200 bg-slate-50 py-16 dark:border-slate-800 dark:bg-slate-900">
  <div class="mx-auto max-w-5xl px-4">
    <h2 class="text-center text-xs font-bold uppercase tracking-[.3em] text-rose-500">
      How it works
    </h2>
    <p class="mt-2 text-center text-2xl font-extrabold text-slate-900 dark:text-slate-100">
      Three steps from discovery to dex entry
    </p>

    <ol class="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
      {#each steps as step, index (step.title)}
        <li class="flex flex-col items-center text-center md:items-start md:text-left">
          <span
            class="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500 text-base font-extrabold text-white shadow"
            aria-hidden="true"
          >
            {index + 1}
          </span>
          <h3 class="mt-3 text-lg font-bold text-slate-900 dark:text-slate-100">
            {step.title}
          </h3>
          <p class="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            {step.body}
          </p>
        </li>
      {/each}
    </ol>
  </div>
</section>
```

- [ ] **Step 2: Verify svelte-check passes**

```bash
npm --workspace web run check
```

Expected: `0 ERRORS`.

- [ ] **Step 3: Commit**

```bash
git add web/src/lib/components/landing/LandingHowItWorks.svelte
git commit -m "feat(web): LandingHowItWorks — 3 numbered steps"
```

---

## Task 7: LandingHero.svelte

Full-viewport hero with the headline, two CTAs (second one hidden when authed), and a bouncing scroll cue.

**Files:**
- Create: `web/src/lib/components/landing/LandingHero.svelte`

- [ ] **Step 1: Create the file with full contents**

```svelte
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
```

- [ ] **Step 2: Verify svelte-check passes**

```bash
npm --workspace web run check
```

Expected: `0 ERRORS`.

- [ ] **Step 3: Commit**

```bash
git add web/src/lib/components/landing/LandingHero.svelte
git commit -m "feat(web): LandingHero — gradient + logo + dual CTA"
```

---

## Task 8: MapSection.svelte — move existing map logic into a section

This is the largest task. The current `+page.svelte` body becomes `MapSection.svelte` with one key change: the loading / error guard moves **inside** the map column so the FilterBar is on screen the whole time.

**Files:**
- Create: `web/src/lib/components/landing/MapSection.svelte`

- [ ] **Step 1: Read the current `+page.svelte` to capture the exact logic being moved**

Run:

```bash
cat /Users/sufianesouissi/Development/dexkepo/web/src/routes/+page.svelte
```

You should see the script block declaring `manholesQ`, `dexQ`, `selected`, `justToggledNo`, `fitTrigger`, the prefecture/search filter derivation, the `fitTrigger` bumping effect, and the `handleToggle` function — plus the loading / error / map render markup. Everything in this file is what's being moved.

- [ ] **Step 2: Create `MapSection.svelte` with the moved logic + restructured shell**

```svelte
<!-- web/src/lib/components/landing/MapSection.svelte -->
<script lang="ts">
  import { createQuery, useQueryClient } from '@tanstack/svelte-query';
  import type { ManholeSummary } from '@dexkepo/shared';
  import { listManholes } from '$lib/api/manholes';
  import { listDex } from '$lib/api/dex';
  import { auth } from '$lib/stores/auth';
  import { filters } from '$lib/stores/filters';
  import Map from '$lib/map/Map.svelte';
  import FilterBar from '$lib/components/FilterBar.svelte';
  import ManholePanel from '$lib/components/ManholePanel.svelte';
  import MapLoader from './MapLoader.svelte';
  import MapError from './MapError.svelte';

  const queryClient = useQueryClient();

  const manholesQ = createQuery<ManholeSummary[]>({
    queryKey: ['manholes'],
    queryFn: listManholes,
  });

  const dexQ = createQuery({
    queryKey: ['dex'],
    queryFn: listDex,
    enabled: !!$auth,
  });

  // Refetch dex when auth changes (login / logout while on the page).
  $effect(() => {
    void $auth;
    queryClient.invalidateQueries({ queryKey: ['dex'] });
  });

  let selected: ManholeSummary | null = $state(null);
  let justToggledNo: string | null = $state(null);
  let fitTrigger = $state(0);

  const all = $derived($manholesQ.data ?? []);
  const visitedSet = $derived(
    new Set(($dexQ.data ?? []).map((entry) => entry.manholeNo)),
  );

  const prefectures = $derived(
    Array.from(new Set(all.map((manhole) => manhole.prefEnName))).sort(),
  );

  const filtered = $derived(
    all.filter((manhole) => {
      if (
        $filters.prefectures.length > 0 &&
        !$filters.prefectures.includes(manhole.prefEnName)
      ) {
        return false;
      }

      if (
        $filters.pokemonSearch &&
        !manhole.pokemonNames.includes($filters.pokemonSearch)
      ) {
        return false;
      }

      return true;
    }),
  );

  // Refit the map whenever the filter changes the result set. Tracking the
  // search/prefecture pair separately avoids spurious refits on marker toggles.
  let lastFitKey = '';
  $effect(() => {
    const key = `${$filters.pokemonSearch}|${$filters.prefectures.join(',')}`;

    if (key !== lastFitKey) {
      lastFitKey = key;
      fitTrigger += 1;
    }
  });

  function handleToggle(manholeNo: string): void {
    queryClient.invalidateQueries({ queryKey: ['dex'] });
    queryClient.invalidateQueries({ queryKey: ['achievements'] });
    queryClient.invalidateQueries({ queryKey: ['favorites'] });

    justToggledNo = manholeNo;
    setTimeout(() => {
      if (justToggledNo === manholeNo) {
        justToggledNo = null;
      }
    }, 700);
  }
</script>

<section
  id="map"
  class="relative h-dvh w-full border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
>
  <div class="absolute inset-0 flex flex-col md:flex-row">
    <FilterBar
      manholes={all}
      prefectures={prefectures}
      visitedCount={visitedSet.size}
      totalCount={all.length}
    />

    <div class="relative min-h-0 flex-1">
      {#if $manholesQ.isLoading}
        <MapLoader />
      {:else if $manholesQ.isError}
        <MapError
          message={($manholesQ.error as Error).message}
          onRetry={() => $manholesQ.refetch()}
        />
      {:else}
        <Map
          manholes={filtered}
          visitedSet={visitedSet}
          showVisited={$filters.showVisited}
          showUnvisited={$filters.showUnvisited}
          justToggledNo={justToggledNo}
          fitTrigger={fitTrigger}
          onSelect={(manhole) => (selected = manhole)}
        />
        {#if selected}
          {#key selected.manholeNo}
            <ManholePanel
              manholeNo={selected.manholeNo}
              name={selected.name}
              prefEnName={selected.prefEnName}
              pictureUrl={selected.pictureUrl}
              pokemonNames={selected.pokemonNames}
              lat={selected.lat}
              lng={selected.lng}
              visited={visitedSet.has(selected.manholeNo)}
              onClose={() => (selected = null)}
              onToggle={() => handleToggle(selected!.manholeNo)}
            />
          {/key}
        {/if}
      {/if}
    </div>
  </div>
</section>
```

- [ ] **Step 3: Verify svelte-check passes**

```bash
npm --workspace web run check
```

Expected: `0 ERRORS`. There will still be one pre-existing warning in `ManholePanel.svelte` about `manholeNo` being captured initially — that's unrelated to this work and is handled by the parent's `{#key}`.

- [ ] **Step 4: Commit**

```bash
git add web/src/lib/components/landing/MapSection.svelte
git commit -m "feat(web): MapSection — extract map logic; FilterBar stays during load"
```

---

## Task 9: Replace `+page.svelte` with the orchestrator

`/` now becomes a tiny file that just stacks the sections in order.

**Files:**
- Modify (full rewrite): `web/src/routes/+page.svelte`

- [ ] **Step 1: Replace the entire contents of `+page.svelte`**

```svelte
<!-- web/src/routes/+page.svelte -->
<script lang="ts">
  // Landing route. All state previously lived here has moved into
  // MapSection.svelte — this file just orders the sections.
  import LandingHero from '$lib/components/landing/LandingHero.svelte';
  import LandingFeatures from '$lib/components/landing/LandingFeatures.svelte';
  import LandingHowItWorks from '$lib/components/landing/LandingHowItWorks.svelte';
  import MapSection from '$lib/components/landing/MapSection.svelte';
  import SiteFooter from '$lib/components/landing/SiteFooter.svelte';
</script>

<!-- `<main>` in +layout.svelte is overflow-hidden so the map page (now a
     section, not the root) can position absolutely. This route opts into
     scrolling via its own wrapper — same convention /me already uses. -->
<div class="h-full overflow-y-auto scroll-smooth">
  <LandingHero />
  <LandingFeatures />
  <LandingHowItWorks />
  <MapSection />
  <SiteFooter />
</div>
```

- [ ] **Step 2: Verify svelte-check passes**

```bash
npm --workspace web run check
```

Expected: `0 ERRORS` plus the same pre-existing `ManholePanel.svelte` warning. No other warnings.

- [ ] **Step 3: Verify the build produces a clean bundle**

```bash
npm --workspace web run build
```

Expected: `✓ built in …` and `Using @sveltejs/adapter-static  Wrote site to "build"  ✔ done`.

- [ ] **Step 4: Commit**

```bash
git add web/src/routes/+page.svelte
git commit -m "feat(web): turn / into multi-section landing"
```

---

## Task 10: End-to-end visual verification

Final pass against the spec's verification list. No code changes in this task — purely confirming behaviour. If any step fails, file the fix as an inline patch in the relevant earlier task.

- [ ] **Step 1: Start the dev servers**

In one terminal:

```bash
npm run dev:api
```

Wait for `API listening on :7777`. (If Neon is cold, retry once.)

In a second terminal:

```bash
npm run dev:web
```

Then open `http://localhost:5173/` in a browser.

- [ ] **Step 2: Anonymous landing**

- Hero fills the viewport. Headline reads "Find every Pokémon manhole cover in Japan.". Two CTAs visible ("Open the map ↓" and "Sign up — track your dex"). Bouncing chevron at the bottom.
- Scroll down: features cards appear (3-up on desktop, stacked on mobile), then how-it-works steps, then the map section, then the footer with the GitHub link.
- Click "Open the map ↓" — page smooth-scrolls to the map section (URL hash becomes `#map`).

- [ ] **Step 3: Logged-in landing**

- Log in via `/login` with an existing user (or `/register`).
- Return to `/`. The "Sign up — track your dex" CTA is **gone**; "Open the map ↓" still present.
- Header still shows the pseudo + logout.

- [ ] **Step 4: Map loader**

- DevTools → Network tab → throttle to "Slow 3G".
- Hard-reload (Cmd+Shift+R / Ctrl+Shift+R).
- Scroll to the map section while it's still loading.
- **Expected**: FilterBar is visible the entire time, progress shows `0 / 0`. Map column shows the spinning Pokéball + "Catching pokémon covers…" caption.
- Once data lands, the tile mosaic + markers replace the loader with no layout shift.
- Disable throttling when done.

- [ ] **Step 5: Reduced motion**

- macOS: System Settings → Accessibility → Display → enable "Reduce motion". Linux/Windows equivalent if applicable.
- Hard-reload `/`.
- During the brief load window, the Pokéball pulses opacity instead of rotating. (You can re-trigger by toggling network throttling.)
- Disable the OS setting when done.

- [ ] **Step 6: Dark mode**

- Click the moon icon in the header.
- Hero gradient still looks correct. Feature cards + how-it-works section + footer all switch to dark variants. Loader caption uses the dark text colour. The map's tile layer switches to `dark_all` (existing behaviour, just confirming nothing broke).

- [ ] **Step 7: Mobile (375 px wide)**

- DevTools → device toolbar → iPhone SE (375 × 667).
- Feature cards stack vertically. How-it-works steps stack. Map section still `h-dvh`. FilterBar appears above the map column inside the section (existing mobile behaviour preserved).
- Hero text doesn't overflow; CTAs stack vertically.

- [ ] **Step 8: Build + final commit if needed**

If any of the above triggered an inline patch, commit it as `fix(web): <what>`. Otherwise nothing left to commit; the previous tasks already shipped the work.

Confirm:

```bash
npm --workspace web run build
```

Expected: clean build, no warnings beyond the long-standing `ManholePanel.svelte` capture warning.

---

## Spec coverage check (self-review)

| Spec section | Implementing task(s) |
|---|---|
| `/` becomes multi-section scrolling page | Task 9 (orchestrator) |
| Hero (logo, headline, two CTAs, scroll cue) | Task 7 |
| Features section | Task 5 |
| How-it-works section | Task 6 |
| Map section that keeps FilterBar visible while loading | Task 8 |
| Map loader (spinning Pokéball + caption) | Task 1 (keyframes) + Task 2 (component) |
| Map error (retryable card replacing inline string) | Task 3 |
| Footer | Task 4 |
| Layout plumbing (don't touch `<main>`; opt into scrolling via wrapper) | Task 9 |
| `html { scroll-behavior: smooth; }` + scroll-smooth class | Task 1 + Task 9 |
| Reduced motion fallback | Task 1 (keyframes) |
| Query lifecycle (queries fire at page load, in cache by the time map scrolls into view) | Task 8 (MapSection mounts immediately because it's part of the initial render) |
| Files untouched: Map.svelte, FilterBar, ManholePanel, Header, stores, api | Confirmed throughout — no edits to those paths |

No gaps detected.

## Placeholder + ambiguity check

- Every code block is complete (no `// …` ellipses, no TODOs, no "implement later").
- Every import path is real (matches existing project structure — e.g. `$lib/api/manholes` exists, `$lib/stores/auth` exists).
- Every Tailwind class uses static-string form so the JIT compiler picks them up at build (no dynamic class concatenation that would get purged).
- The `Map`, `FilterBar`, and `ManholePanel` prop names used in MapSection match their current public signatures exactly (verified against the existing `+page.svelte`).
- The CSS class names `dx-pokeball-spin` / `dx-pokeball-breathe` / `dx-pokeball-pulse` defined in Task 1 are consumed verbatim in Task 2.
