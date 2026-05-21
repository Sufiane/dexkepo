<script lang="ts">
  import { locale, setLocale, type Locale } from '$lib/i18n/locale';

  const options: Array<{ code: Locale; label: string }> = [
    { code: 'en', label: 'EN' },
    { code: 'ja', label: '日本語' },
  ];
</script>

<div
  class="inline-flex overflow-hidden rounded-full bg-white/15 p-0.5 text-xs font-bold ring-1 ring-white/20"
  role="group"
  aria-label="Language"
>
  {#each options as opt (opt.code)}
    <button
      type="button"
      onclick={() => setLocale(opt.code)}
      class={`rounded-full px-2.5 py-1 transition-colors ${
        $locale === opt.code
          ? 'bg-white text-rose-600 shadow'
          : 'text-white/85 hover:text-white'
      }`}
      aria-pressed={$locale === opt.code}
    >
      {opt.label}
    </button>
  {/each}
</div>
