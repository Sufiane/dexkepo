<!-- web/src/lib/components/landing/MapError.svelte -->
<script lang="ts">
  import { t } from '$lib/i18n/locale';

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
    {$t('map.errorTitle')}
  </p>
  <p class="max-w-md text-sm text-slate-600 dark:text-slate-400">{message}</p>
  <button
    type="button"
    onclick={onRetry}
    class="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
  >
    {$t('map.retry')}
  </button>
</div>
