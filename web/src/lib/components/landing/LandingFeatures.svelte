<!-- web/src/lib/components/landing/LandingFeatures.svelte -->
<script lang="ts">
  import { t } from '$lib/i18n/locale';

  type Feature = { icon: string; key: 'browse' | 'mark' | 'achieve' };

  const features: Feature[] = [
    { icon: '🗾', key: 'browse' },
    { icon: '✅', key: 'mark' },
    { icon: '🏆', key: 'achieve' },
  ];
</script>

<section class="border-t border-slate-200 bg-white py-16 dark:border-slate-800 dark:bg-slate-950">
  <div class="mx-auto max-w-5xl px-4">
    <h2 class="text-center text-xs font-bold uppercase tracking-[.3em] text-rose-500">
      {$t('landing.features.heading')}
    </h2>

    <ul class="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
      {#each features as feature (feature.key)}
        <li
          class="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center transition hover:-translate-y-0.5 hover:shadow-md
                 dark:border-slate-700 dark:bg-slate-900"
        >
          <span class="text-4xl" aria-hidden="true">{feature.icon}</span>
          <h3 class="mt-3 text-lg font-bold text-slate-900 dark:text-slate-100">
            {$t(`landing.features.${feature.key}.title`)}
          </h3>
          <p class="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            {$t(`landing.features.${feature.key}.body`)}
          </p>
        </li>
      {/each}
    </ul>
  </div>
</section>
