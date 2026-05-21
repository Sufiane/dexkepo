<script lang="ts">
  import { t, locale } from '$lib/i18n/locale';

  type Props = {
    pseudo: string;
    memberSince: string;
    visitedCount: number;
    totalCount: number;
  };

  let { pseudo, memberSince, visitedCount, totalCount }: Props = $props();

  const completion = $derived(
    totalCount === 0 ? 0 : (visitedCount / totalCount) * 100,
  );

  const memberDate = $derived(
    new Date(memberSince).toLocaleDateString($locale === 'ja' ? 'ja-JP' : undefined, {
      year: 'numeric',
      month: 'long',
    }),
  );
</script>

<header class="rounded-3xl bg-gradient-to-br from-rose-500 via-red-500 to-orange-500 p-6 text-white shadow-lg">
  <p class="text-xs font-bold uppercase tracking-[.25em] text-white/85">{$t('trainer.memberSinceTrainer')}</p>
  <h1 class="mt-1 text-3xl font-extrabold">{pseudo}</h1>
  <p class="text-sm text-white/80">{$t('trainer.memberSince', { date: memberDate })}</p>

  <div class="mt-5 flex items-end gap-3">
    <div>
      <p class="text-[10px] font-bold uppercase tracking-widest text-white/70">{$t('me.progress')}</p>
      <p class="text-4xl font-extrabold tabular-nums">
        {visitedCount}<span class="text-2xl text-white/70"> / {totalCount}</span>
      </p>
    </div>
    <p class="ml-auto text-xl font-bold tabular-nums text-white/90">
      {completion.toFixed(1)}%
    </p>
  </div>

  <div class="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/25">
    <div
      class="h-full rounded-full bg-white shadow-inner"
      style="width: {completion.toFixed(1)}%"
    ></div>
  </div>
</header>
