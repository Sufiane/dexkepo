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
