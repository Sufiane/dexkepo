<script lang="ts">
  import { goto } from '$app/navigation';
  import { login } from '$lib/api/auth';
  import { setAuth } from '$lib/stores/auth';
  import { t } from '$lib/i18n/locale';

  let email = $state('');
  let password = $state('');
  let busy = $state(false);
  let error: string | null = $state(null);

  async function submit(e: Event) {
    e.preventDefault();
    busy = true;
    error = null;
    try {
      const res = await login({ email, password });
      setAuth(res);
      goto('/');
    } catch (err) {
      error = (err as Error).message;
    } finally {
      busy = false;
    }
  }
</script>

<div class="mx-auto mt-12 w-full max-w-sm rounded-2xl bg-white p-6 shadow dark:bg-slate-800">
  <h1 class="text-xl font-bold text-slate-900 dark:text-slate-100">{$t('auth.login.title')}</h1>
  <form class="mt-4 space-y-3" onsubmit={submit}>
    <label class="block text-sm">
      <span class="text-slate-700 dark:text-slate-300">{$t('auth.login.email')}</span>
      <input
        type="email"
        required
        bind:value={email}
        class="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
      />
    </label>
    <label class="block text-sm">
      <span class="text-slate-700 dark:text-slate-300">{$t('auth.login.password')}</span>
      <input
        type="password"
        required
        minlength="8"
        bind:value={password}
        class="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
      />
    </label>
    {#if error}<p class="text-sm text-red-600">{error}</p>{/if}
    <button
      type="submit"
      disabled={busy}
      class="w-full rounded bg-slate-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50 dark:bg-rose-500 dark:hover:bg-rose-600"
    >{busy ? $t('auth.login.busy') : $t('auth.login.submit')}</button>
  </form>
  <p class="mt-3 text-sm text-slate-600 dark:text-slate-400">
    {$t('auth.login.noAccount')} <a href="/register" class="text-slate-900 underline dark:text-slate-100">{$t('auth.login.signUpLink')}</a>
  </p>
</div>
