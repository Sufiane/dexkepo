<script lang="ts">
  // Landing route. All state previously lived here has moved into
  // MapSection.svelte — this file just orders the sections.
  // Logged-in users skip the marketing copy and land straight on the map;
  // anonymous users get the full landing pitch first.
  import { auth } from '$lib/stores/auth';
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
  {#if $auth}
    <MapSection />
  {:else}
    <LandingHero />
    <LandingFeatures />
    <LandingHowItWorks />
    <MapSection />
    <SiteFooter />
  {/if}
</div>
