<!-- web/src/lib/components/landing/MapLoader.svelte -->
<script lang="ts">
  import { t } from '$lib/i18n/locale';
</script>

<div
  role="status"
  aria-live="polite"
  class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-50 dark:bg-slate-900"
>
  <div class="dx-pokeball-breathe">
    <div class="dx-pokeball-spin">
      <svg viewBox="0 0 100 100" width="96" height="96" aria-hidden="true">
        <!-- Top half: red -->
        <path d="M 4 50 A 46 46 0 0 1 96 50 Z" fill="#dc2626" />
        <!-- Bottom half: white -->
        <path d="M 4 50 A 46 46 0 0 0 96 50 Z" fill="#ffffff" />
        <!-- Outer border + equator -->
        <circle cx="50" cy="50" r="46" fill="none" stroke="#0f172a" stroke-width="4" />
        <line x1="4" y1="50" x2="96" y2="50" stroke="#0f172a" stroke-width="4" />
        <!-- Centre button -->
        <circle cx="50" cy="50" r="13" fill="#ffffff" stroke="#0f172a" stroke-width="4" />
        <circle cx="50" cy="50" r="5" fill="#ffffff" stroke="#0f172a" stroke-width="2" />
      </svg>
    </div>
  </div>

  <p class="text-sm font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
    {$t('map.loaderCaption')}
  </p>
</div>
