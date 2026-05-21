<!-- web/src/lib/components/landing/LandingFold.svelte
     Above-the-fold hero for anonymous visitors. Packs hero + 3 features +
     3 numbered steps into a single h-dvh panel so first-time visitors see
     "what + why + how" before any scroll. -->
<script lang="ts">
  import { auth } from '$lib/stores/auth';
  import { t } from '$lib/i18n/locale';

  const featureKeys = ['browse', 'mark', 'achieve'] as const;
  const featureIcons: Record<(typeof featureKeys)[number], string> = {
    browse: '🗾',
    mark: '✅',
    achieve: '🏆',
  };

  const stepNumbers = [1, 2, 3] as const;
</script>

<section
  class="relative flex h-dvh w-full flex-col items-center justify-center gap-6 overflow-hidden
         bg-gradient-to-br from-rose-500 via-red-500 to-orange-500 px-4 py-6 text-white sm:gap-8 sm:py-8"
>
  <!-- Soft radial highlight behind the content -->
  <div
    aria-hidden="true"
    class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,.18),transparent_60%)]"
  ></div>

  <!-- Hero -->
  <div class="relative flex flex-col items-center gap-3 text-center sm:gap-4">
    <span
      class="relative inline-block h-14 w-14 overflow-hidden rounded-full bg-white shadow-2xl ring-4 ring-white/60 sm:h-16 sm:w-16"
      aria-hidden="true"
    >
      <span class="absolute inset-x-0 top-0 h-1/2 bg-red-600"></span>
      <span class="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 bg-slate-900"></span>
      <span
        class="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white ring-[3px] ring-slate-900"
      ></span>
    </span>

    <div class="max-w-3xl">
      <h1 class="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl md:text-5xl">
        {$t('landing.hero.title')}
      </h1>
      <p class="mt-2 text-sm text-white/90 sm:text-base md:text-lg">
        {$t('landing.hero.tagline')}
      </p>
    </div>

    <div class="flex flex-col items-center gap-2 sm:flex-row sm:gap-3">
      <a
        href="#map"
        class="rounded-full bg-white px-5 py-2 text-sm font-bold text-rose-600 shadow-lg transition hover:scale-105 hover:bg-rose-50"
      >
        {$t('landing.hero.openMap')}
      </a>
      {#if !$auth}
        <a
          href="/register"
          class="rounded-full border-2 border-white/80 px-5 py-2 text-sm font-bold text-white transition hover:bg-white/15"
        >
          {$t('landing.hero.signUp')}
        </a>
      {/if}
    </div>
  </div>

  <!-- Features + how-it-works strip sits right under the hero, sharing the
       same gradient. Cards are translucent so the panel feels continuous. -->
  <div class="relative mx-auto w-full max-w-6xl">
    <!-- 3 features -->
    <ul class="grid grid-cols-3 gap-2 sm:gap-3">
      {#each featureKeys as key (key)}
        <li class="rounded-xl bg-white/10 px-2 py-2 text-center backdrop-blur-sm ring-1 ring-white/15 sm:px-3 sm:py-3">
          <span class="text-xl sm:text-2xl" aria-hidden="true">{featureIcons[key]}</span>
          <p class="mt-1 text-[11px] font-bold sm:text-sm">
            {$t(`landing.features.${key}.title`)}
          </p>
          <p class="hidden text-[11px] leading-snug text-white/85 sm:block">
            {$t(`landing.features.${key}.body`)}
          </p>
        </li>
      {/each}
    </ul>

    <!-- 3 steps, very compact -->
    <ol class="mt-3 grid grid-cols-3 gap-2 sm:mt-4 sm:gap-3">
      {#each stepNumbers as n (n)}
        <li class="flex items-start gap-2 rounded-xl bg-white/5 px-2 py-2 ring-1 ring-white/10 sm:px-3 sm:py-3">
          <span
            class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white text-xs font-extrabold text-rose-600 shadow sm:h-7 sm:w-7 sm:text-sm"
            aria-hidden="true"
          >
            {n}
          </span>
          <div class="text-left">
            <p class="text-[11px] font-bold leading-tight sm:text-sm">
              {$t(`landing.how.step${n}Title`)}
            </p>
            <p class="hidden text-[11px] leading-snug text-white/85 sm:block">
              {$t(`landing.how.step${n}Body`)}
            </p>
          </div>
        </li>
      {/each}
    </ol>
  </div>

  <!-- Scroll cue, only when there's room (bigger viewports). -->
  <a
    href="#map"
    class="absolute bottom-2 left-1/2 hidden -translate-x-1/2 text-white/80 transition hover:text-white md:block"
    aria-label={$t('landing.hero.scrollCue')}
  >
    <svg viewBox="0 0 24 24" class="h-6 w-6 animate-bounce" fill="currentColor" aria-hidden="true">
      <path d="M12 16l-6-6h12l-6 6z" />
    </svg>
  </a>
</section>
