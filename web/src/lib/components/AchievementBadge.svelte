<script lang="ts">
  import type { AchievementStatus } from '@dexkepo/shared';

  type Props = {
    achievement: AchievementStatus;
  };

  let { achievement }: Props = $props();

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

    return new Date(achievement.unlockedAt).toLocaleDateString();
  });
</script>

<div
  class="group relative flex flex-col items-center rounded-2xl border p-3 text-center transition"
  class:border-amber-300={achievement.unlocked}
  class:bg-gradient-to-br={achievement.unlocked}
  class:from-amber-50={achievement.unlocked}
  class:to-orange-50={achievement.unlocked}
  class:shadow-sm={achievement.unlocked}
  class:border-slate-200={!achievement.unlocked}
  class:bg-slate-50={!achievement.unlocked}
  class:opacity-70={!achievement.unlocked}
>
  <span
    class="text-3xl"
    class:grayscale={!achievement.unlocked}
    aria-hidden="true"
  >
    {achievement.icon}
  </span>

  <p
    class="mt-1 text-sm font-bold leading-tight"
    class:text-slate-900={achievement.unlocked}
    class:text-slate-500={!achievement.unlocked}
  >
    {achievement.title}
  </p>

  <p class="mt-0.5 text-[11px] leading-snug text-slate-500">
    {achievement.description}
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
