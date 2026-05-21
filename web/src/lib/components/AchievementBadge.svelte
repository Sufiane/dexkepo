<script lang="ts">
  import type { AchievementStatus } from '@dexkepo/shared';
  import { t, locale } from '$lib/i18n/locale';
  import { dict } from '$lib/i18n/dictionary';

  type Props = {
    achievement: AchievementStatus;
  };

  let { achievement }: Props = $props();

  // Prefer locale-specific copy from the dictionary; fall back to whatever
  // the backend sent (English) if a key is missing — keeps new achievements
  // shipping fine before translations land.
  const title = $derived.by(() => {
    const localised = dict[$locale].achievements?.[
      achievement.id as keyof typeof dict.en.achievements
    ];

    return localised?.title ?? achievement.title;
  });

  const description = $derived.by(() => {
    const localised = dict[$locale].achievements?.[
      achievement.id as keyof typeof dict.en.achievements
    ];

    return localised?.description ?? achievement.description;
  });

  const pct = $derived.by(() => {
    if (!achievement.progress) {
      return achievement.unlocked ? 100 : 0;
    }

    const { current, target } = achievement.progress;

    if (target <= 0) {
      return 0;
    }

    return Math.min(100, (current / target) * 100);
  });

  const unlockedDate = $derived.by(() => {
    if (!achievement.unlockedAt) {
      return null;
    }

    return new Date(achievement.unlockedAt).toLocaleDateString(
      $locale === 'ja' ? 'ja-JP' : undefined,
    );
  });
  // Touch `t` so the reactive subscription stays alive even if we only
  // use it indirectly through `dict[$locale]`.
  void t;
</script>

<div
  class={`group relative flex flex-col items-center rounded-2xl border p-3 text-center transition ${
    achievement.unlocked
      ? 'border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 shadow-sm dark:border-amber-700 dark:from-amber-950/40 dark:to-orange-950/40'
      : 'border-slate-200 bg-slate-50 opacity-70 dark:border-slate-700 dark:bg-slate-800'
  }`}
>
  <span
    class="text-3xl"
    class:grayscale={!achievement.unlocked}
    aria-hidden="true"
  >
    {achievement.icon}
  </span>

  <p
    class={`mt-1 text-sm font-bold leading-tight ${
      achievement.unlocked
        ? 'text-slate-900 dark:text-amber-100'
        : 'text-slate-500 dark:text-slate-400'
    }`}
  >
    {title}
  </p>

  <p class="mt-0.5 text-[11px] leading-snug text-slate-500 dark:text-slate-400">
    {description}
  </p>

  {#if achievement.progress && !achievement.unlocked}
    <div class="mt-2 w-full">
      <div class="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          class="h-full bg-rose-500 transition-all"
          style="width: {pct.toFixed(1)}%"
        ></div>
      </div>
      <p class="mt-1 text-[10px] tabular-nums text-slate-500">
        {achievement.progress.current} / {achievement.progress.target}
      </p>
    </div>
  {/if}

  {#if achievement.unlocked && unlockedDate}
    <p class="mt-1 text-[10px] font-semibold uppercase tracking-wider text-amber-600">
      ⭐ {unlockedDate}
    </p>
  {/if}
</div>
