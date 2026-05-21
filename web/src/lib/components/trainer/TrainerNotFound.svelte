<script lang="ts">
  import { t } from '$lib/i18n/locale';
</script>

<div class="mx-auto mt-16 max-w-md rounded-3xl bg-white p-8 text-center shadow dark:bg-slate-800">
  <p class="text-4xl">🕵️</p>
  <h1 class="mt-3 text-xl font-extrabold text-slate-900 dark:text-slate-100">
    {$t('trainer.notFound.title')}
  </h1>
  <p class="mt-2 text-sm text-slate-500">
    {$t('trainer.notFound.sub')}
  </p>
  <a
    href="/"
    class="mt-5 inline-block rounded-full bg-rose-500 px-5 py-2 text-sm font-bold text-white hover:bg-rose-600"
  >
    {$t('trainer.notFound.cta')}
  </a>
</div>
