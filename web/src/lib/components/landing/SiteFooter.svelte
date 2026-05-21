<!-- web/src/lib/components/landing/SiteFooter.svelte -->
<script lang="ts">
  import { t } from '$lib/i18n/locale';
</script>

<footer
  class="border-t border-slate-200 bg-slate-100 px-4 py-6 text-center text-xs text-slate-600
         dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
>
  <p>
    {$t('landing.footer.product')} ·
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
    {$t('landing.footer.attribution')}
  </p>
</footer>
