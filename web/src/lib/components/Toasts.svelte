<script lang="ts">
  import { toasts, dismissToast, type ToastVariant } from '$lib/stores/toasts';

  const variantClass: Record<ToastVariant, string> = {
    info: 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900',
    success: 'bg-emerald-600 text-white',
    warning: 'bg-amber-500 text-white',
    error: 'bg-rose-600 text-white',
  };
</script>

<!-- Stacked bottom-right (desktop) / bottom-center (mobile). z-2000 sits on
     top of the map's Leaflet panes + the ManholePanel (z-1000). -->
<div class="pointer-events-none fixed bottom-4 left-1/2 z-[2000] flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4 sm:left-auto sm:right-4 sm:translate-x-0">
  {#each $toasts as toast (toast.id)}
    <div
      class={`pointer-events-auto flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-semibold shadow-lg ring-1 ring-black/10 ${variantClass[toast.variant]}`}
      role="status"
      aria-live="polite"
    >
      <span class="flex-1">{toast.message}</span>
      {#if toast.action}
        <button
          type="button"
          onclick={() => {
            toast.action?.onClick();
            dismissToast(toast.id);
          }}
          class="rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider hover:bg-white/30"
        >
          {toast.action.label}
        </button>
      {/if}
      <button
        type="button"
        onclick={() => dismissToast(toast.id)}
        aria-label="Dismiss"
        class="text-white/80 hover:text-white"
      >
        ✕
      </button>
    </div>
  {/each}
</div>
