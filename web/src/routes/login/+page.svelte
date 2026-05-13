<script lang="ts">
  import { goto } from '$app/navigation';
  import { login } from '$lib/api/auth';
  import { setAuth } from '$lib/stores/auth';

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

<div class="mx-auto mt-12 w-full max-w-sm rounded-2xl bg-white p-6 shadow">
  <h1 class="text-xl font-bold">Login</h1>
  <form class="mt-4 space-y-3" onsubmit={submit}>
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
      <span class="text-slate-700">Password</span>
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
    >{busy ? '...' : 'Login'}</button>
  </form>
  <p class="mt-3 text-sm text-slate-600">
    No account? <a href="/register" class="text-slate-900 underline">Sign up</a>
  </p>
</div>
