<script lang="ts">
  import { goto } from '$app/navigation';
  import { register } from '$lib/api/auth';
  import { setAuth } from '$lib/stores/auth';

  let pseudo = $state('');
  let email = $state('');
  let password = $state('');
  let busy = $state(false);
  let error: string | null = $state(null);

  async function submit(e: Event) {
    e.preventDefault();
    busy = true;
    error = null;
    try {
      const res = await register({ pseudo, email, password });
      setAuth(res);
      goto('/');
    } catch (err) {
      error = (err as Error).message;
    } finally {
      busy = false;
    }
  }
</script>

<div class="mx-auto mt-12 w-full max-w-sm rounded-2xl bg-white p-6 shadow">
  <h1 class="text-xl font-bold">Sign up</h1>
  <form class="mt-4 space-y-3" onsubmit={submit}>
    <label class="block text-sm">
      <span class="text-slate-700">Pseudo</span>
      <input
        type="text"
        required
        minlength="3"
        maxlength="32"
        bind:value={pseudo}
        class="mt-1 w-full rounded border border-slate-300 px-2 py-1.5"
      />
    </label>
    <label class="block text-sm">
      <span class="text-slate-700">Email</span>
      <input
        type="email"
        required
        bind:value={email}
        class="mt-1 w-full rounded border border-slate-300 px-2 py-1.5"
      />
    </label>
    <label class="block text-sm">
      <span class="text-slate-700">Password (≥ 8 chars)</span>
      <input
        type="password"
        required
        minlength="8"
        bind:value={password}
        class="mt-1 w-full rounded border border-slate-300 px-2 py-1.5"
      />
    </label>
    {#if error}<p class="text-sm text-red-600">{error}</p>{/if}
    <button
      type="submit"
      disabled={busy}
      class="w-full rounded bg-slate-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
    >{busy ? '...' : 'Create account'}</button>
  </form>
  <p class="mt-3 text-sm text-slate-600">
    Already have one? <a href="/login" class="text-slate-900 underline">Log in</a>
  </p>
</div>
