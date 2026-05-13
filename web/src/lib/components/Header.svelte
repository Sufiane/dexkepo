<script lang="ts">
  import { auth, logout } from '../stores/auth';
  import { goto } from '$app/navigation';

  function handleLogout() {
    logout();
    goto('/');
  }
</script>

<header class="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2">
  <a href="/" class="text-lg font-bold tracking-tight">dexkepo</a>
  <nav class="flex items-center gap-3 text-sm">
    {#if $auth}
      <a href="/me" class="text-slate-700 hover:underline">{$auth.user.pseudo}</a>
      <button class="rounded bg-slate-100 px-2 py-1 hover:bg-slate-200" onclick={handleLogout}>logout</button>
    {:else}
      <a href="/login" class="text-slate-700 hover:underline">login</a>
      <a href="/register" class="rounded bg-slate-900 px-3 py-1 text-white hover:bg-slate-700">sign up</a>
    {/if}
  </nav>
</header>
