# Landing page + map loader

**Status**: design approved (2026-05-20), implementation pending.

## Context

Today `/` dumps anonymous visitors straight into an OpenStreetMap view of 470 manhole covers with zero explanation of what dexkepo is. While the manholes data loads, the entire layout — including the FilterBar — is replaced by a plain "Loading map…" text, so there's nothing useful on screen during the wait.

We want:

1. A real **multi-section landing page** that introduces the product before users encounter the map.
2. A **branded map loader** that keeps the FilterBar visible during data fetch and shows something more delightful than placeholder text.

The map and its existing interactions are not changing — only the framing around them.

## Decisions

| Decision | Choice |
|---|---|
| Routing | `/` is a single scrolling page containing landing **and** the map (`#map` anchor). No new routes. |
| Hero scope | Full landing: hero → features → how-it-works → map → footer. |
| Loader treatment | Spinning Pokéball SVG with the caption "Catching pokémon covers…". |
| Component layout | Decompose into focused files under `web/src/lib/components/landing/`. |

## Page structure

```
┌─────────────────────────────────────────┐
│  <Header />            sticky, existing │
├─────────────────────────────────────────┤
│  <LandingHero />       h-dvh            │  Hero + 2 CTAs + scroll cue
├─────────────────────────────────────────┤
│  <LandingFeatures />   auto height      │  3 feature cards
├─────────────────────────────────────────┤
│  <LandingHowItWorks /> auto height      │  3 numbered steps
├─────────────────────────────────────────┤
│  <MapSection />        h-dvh, id="map"  │  FilterBar + Map (current behavior)
├─────────────────────────────────────────┤
│  <SiteFooter />        auto height      │
└─────────────────────────────────────────┘
```

`+page.svelte` becomes a thin orchestrator that just renders these sections in order. No state lives in it.

## Component specs

### `<LandingHero />` — `h-dvh`, flex column, centered

- Background: rose→red→orange gradient continuation from the Header.
- Large CSS-shape pokéball logo (~80px), upscaled version of the one in `Header.svelte`.
- Title: `text-5xl md:text-6xl font-extrabold tracking-tight text-white` — "Find every Pokémon manhole cover in Japan."
- Tagline: "470 hand-painted poké-fúta. One personal dex. Track what you've visited."
- Primary CTA: white button `<a href="#map">Open the map ↓</a>`, anchored. Mild attention-pulse animation.
- Secondary CTA: outlined-on-gradient `<a href="/register">Sign up — track your dex</a>`. Hidden when user is already authed.
- Bouncing chevron at the bottom; fades out when the page is scrolled.
- Dark mode: keep the same warm gradient (works on dark).

### `<LandingFeatures />` — auto height, responsive grid

Three cards (1 column on mobile, 3 columns on `md:`). Each card: emoji icon + bold title + one-sentence pitch. Light slate-50 bg, slate-200 ring, hover lift.

| Icon | Title | Pitch |
|---|---|---|
| 🗾 | Browse all 470 | Filter the map by prefecture or Pokémon. |
| ✅ | Mark visits as you go | Sign up, tap a cover, done. |
| 🏆 | Earn achievements | Streaks, regions, legendaries. |

### `<LandingHowItWorks />` — auto height, 3 numbered steps

Horizontal on `md:`, vertical on mobile. Big circled numerals on rose accent.

1. **Find a cover.** Open the map, click any pin to see its Pokémon and address.
2. **Visit it.** Tap "Open in Google Maps" for directions. Real-world step.
3. **Mark it.** Tap "Mark as visited" — confetti, the marker glows green, your profile updates.

No screenshots in v1.

### `<MapSection />` — `h-dvh`, `id="map"`, relative

Takes over the current `+page.svelte` body. Owns the three TanStack Query hooks (`manholes`, `dex`, `favorites`), the filter wiring, the marker pop, the `selected` state, and the `ManholePanel` render.

Crucially, the loading/error guard moves **inside** the map column, not around the whole layout:

```svelte
<section id="map" class="relative h-dvh w-full">
  <div class="absolute inset-0 flex flex-col md:flex-row">
    <FilterBar ... />
    <div class="relative min-h-0 flex-1">
      {#if manholesQ.isLoading}
        <MapLoader />
      {:else if manholesQ.isError}
        <MapError msg={...} retry={() => manholesQ.refetch()} />
      {:else}
        <Map ... />
        {#if selected}<ManholePanel ... />{/if}
      {/if}
    </div>
  </div>
</section>
```

The FilterBar is on screen from the first paint — the progress bar starts at `0 / 0` and updates in place once data lands.

### `<MapLoader />`

- Inline SVG pokéball, ~96px. Same shape as the Header logo.
- Rotation: `@keyframes pokeball-spin { from { transform: rotate(0) } to { transform: rotate(360deg) } }`, 1.4s linear infinite, plus a subtle 2s scale breathe (`.98 ↔ 1.02`).
- Caption below: `text-sm font-semibold text-slate-500 dark:text-slate-400 tracking-wide` — "Catching pokémon covers…"
- Centered absolutely; same neutral background as the map area so the swap to tiles feels natural.
- A11y: `role="status" aria-live="polite"`.
- Respects `prefers-reduced-motion: reduce` → opacity pulse instead of rotation.

### `<MapError />`

Mirror layout of the loader: red text + the error message + a retry button calling `manholesQ.refetch()`. Replaces today's inline error string.

### `<SiteFooter />`

Two-line slate-100 footer:
- `dexkepo · personal Pokémon manhole-cover dex` · GitHub link.
- Attribution: "Manhole imagery © The Pokémon Company · Tiles © OpenStreetMap / CARTO".

## Layout plumbing

Current [+layout.svelte](../../../web/src/routes/+layout.svelte) sets `<main class="relative min-h-0 flex-1 overflow-hidden">` so the map page can `absolute inset-0`. We keep that — it's load-bearing for the map.

The new `/` route follows the convention already established by `/me`: opt into scrolling via its own wrapper.

```svelte
<!-- web/src/routes/+page.svelte -->
<div class="h-full overflow-y-auto">
  <LandingHero />
  <LandingFeatures />
  <LandingHowItWorks />
  <MapSection />
  <SiteFooter />
</div>
```

`<MapSection>` is `h-dvh` and `position: relative`, so the inner `<Map>` keeps its `absolute inset-0` fill **within the section** — when scrolled into view it occupies the full viewport, then footer follows. Map.svelte itself doesn't change.

Add `html { scroll-behavior: smooth; }` to [app.css](../../../web/src/app.css) so the "Open the map" anchor smooth-scrolls. Because the actual scroll container is the page-level `<div>` rather than `html`, also apply `scroll-behavior: smooth` to that wrapper (Tailwind: `scroll-smooth`) to be safe.

## Files

### New

```
web/src/lib/components/landing/
  LandingHero.svelte
  LandingFeatures.svelte
  LandingHowItWorks.svelte
  MapSection.svelte
  MapLoader.svelte
  MapError.svelte
  SiteFooter.svelte
```

### Modified

```
web/src/routes/+page.svelte     # thin orchestrator inside an overflow-y-auto wrapper
web/src/app.css                 # @keyframes pokeball-spin + reduced-motion override
                                # html { scroll-behavior: smooth }
```

`+layout.svelte` is **not** touched — `<main>` stays `overflow-hidden`; `/` opts into scrolling via its own wrapper (same pattern as `/me`).

### Untouched (consumed but not edited)

- [web/src/lib/map/Map.svelte](../../../web/src/lib/map/Map.svelte) — moves into MapSection's tree, no internal changes.
- [web/src/lib/components/FilterBar.svelte](../../../web/src/lib/components/FilterBar.svelte) — same.
- [web/src/lib/components/ManholePanel.svelte](../../../web/src/lib/components/ManholePanel.svelte) — same.
- [web/src/lib/components/Header.svelte](../../../web/src/lib/components/Header.svelte) — already sticky and matches the brand.
- All stores ([auth](../../../web/src/lib/stores/auth.ts), [filters](../../../web/src/lib/stores/filters.ts), [theme](../../../web/src/lib/stores/theme.ts)) and all api clients.

## Query lifecycle (perceived performance)

The three queries currently live at the top of `+page.svelte`. Once they move into `<MapSection>`, they still fire at page load because `<MapSection>` is mounted in the initial render — it's just below the fold. Net effect: by the time the user scrolls past hero + features + how-it-works, the map data is usually already in the cache. Free perf win.

## Verification

Local: `npm run dev:api` + `npm run dev:web`.

1. **Anonymous landing.** Visit `/`. Hero fills the viewport, "Sign up" CTA visible. Scroll past features → how-it-works → map → footer. Click "Open the map ↓" → page smooth-scrolls to `#map`.
2. **Logged-in landing.** "Sign up" CTA is hidden (we'll just omit it when `$auth` is truthy). Otherwise identical.
3. **Loader.** DevTools → Network → throttle "Slow 3G", reload. FilterBar visible the entire time with progress reading `0 / 0`. Map column shows the spinning pokéball with the caption. Once data arrives, the tile mosaic + markers replace it with no layout shift.
4. **Reduced motion.** macOS → Accessibility → Reduce motion → on. Reload. Pokéball pulses opacity instead of rotating.
5. **Dark mode.** Toggle moon in header. Hero gradient stays warm; cards flip dark; loader caption uses dark variant.
6. **Mobile (375px).** Feature cards stack; how-it-works steps stack; map section still `h-dvh`; FilterBar appears above the map column (existing mobile behaviour).
7. **Build.** `npm --workspace web run check` → 0 errors. `npm --workspace web run build` → success.

## Out of scope

- Real screenshots in `<LandingHowItWorks />` (asset work, defer).
- Auto-redirecting logged-in users away from the landing — they may still want to revisit it.
- Trip-planner CTAs or any new product features.
- Newsletter / contact form.
- i18n (Japanese UI) — landing is English-only for v1.
- Showing a real tile preview as the loader background (ruled out during brainstorm).
