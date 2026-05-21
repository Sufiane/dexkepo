<script lang="ts">
  import { page } from '$app/stores';

  const status = $derived($page.status);
  const message = $derived($page.error?.message ?? 'Something went wrong');
  const is404 = $derived(status === 404);
</script>

<div class="flex h-full items-center justify-center p-6">
  <div class="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow dark:bg-slate-800">
    <p class="text-5xl">{is404 ? '🗺️' : '⚠️'}</p>
    <p class="mt-3 text-xs font-bold uppercase tracking-[.25em] text-slate-500">
      Error {status}
    </p>
    <h1 class="mt-1 text-2xl font-extrabold text-slate-900 dark:text-slate-100">
      {is404 ? 'Off the map' : 'Something broke'}
    </h1>
    <p class="mt-2 text-sm text-slate-500">
      {is404
        ? "We couldn't find that page. Maybe a manhole ate it."
        : message}
    </p>
    <div class="mt-5 flex flex-wrap justify-center gap-2">
      <a
        href="/"
        class="rounded-full bg-rose-500 px-5 py-2 text-sm font-bold text-white hover:bg-rose-600"
      >
        Back to the map
      </a>
      <button
        type="button"
        onclick={() => history.back()}
        class="rounded-full bg-slate-200 px-5 py-2 text-sm font-bold text-slate-900 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
      >
        Go back
      </button>
    </div>
  </div>
</div>
