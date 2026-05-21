<!-- web/src/lib/components/landing/LandingHowItWorks.svelte -->
<script lang="ts">
  import { t } from '$lib/i18n/locale';

  const stepKeys = [1, 2, 3] as const;
</script>

<section class="border-t border-slate-200 bg-slate-50 py-16 dark:border-slate-800 dark:bg-slate-900">
  <div class="mx-auto max-w-5xl px-4">
    <h2 class="text-center text-xs font-bold uppercase tracking-[.3em] text-rose-500">
      {$t('landing.how.heading')}
    </h2>

    <ol class="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
      {#each stepKeys as n (n)}
        <li class="flex flex-col items-center text-center md:items-start md:text-left">
          <span
            class="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500 text-base font-extrabold text-white shadow"
            aria-hidden="true"
          >
            {n}
          </span>
          <h3 class="mt-3 text-lg font-bold text-slate-900 dark:text-slate-100">
            {$t(`landing.how.step${n}Title`)}
          </h3>
          <p class="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            {$t(`landing.how.step${n}Body`)}
          </p>
        </li>
      {/each}
    </ol>
  </div>
</section>
