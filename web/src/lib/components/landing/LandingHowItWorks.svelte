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
      body: 'Tap "Open in Google Maps" for directions. The real-world step.',
    },
    {
      title: 'Mark it',
      body: 'Once you\'re back, tap "Mark as visited". Confetti, green ring, profile updates.',
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
