<script lang="ts">
  import { auth, logout } from '../stores/auth';
  import { goto } from '$app/navigation';

  function handleLogout(): void {
    logout();
    goto('/');
  }
</script>

<header class="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 px-4 py-3 text-white shadow-sm">
  <a href="/" class="flex items-center gap-2 group">
    <!-- Logo: stylized pokéball / manhole-cover hybrid -->
    <span
      class="relative inline-block h-9 w-9 rounded-full bg-white shadow-inner overflow-hidden ring-2 ring-white/60 transition-transform group-hover:rotate-12"
      aria-hidden="true"
    >
      <span class="absolute inset-x-0 top-0 h-1/2 bg-red-600"></span>
      <span class="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 bg-slate-900"></span>
      <span
        class="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white ring-2 ring-slate-900"
      ></span>
    </span>

    <div class="flex flex-col leading-tight">
      <span class="text-lg font-extrabold tracking-tight">dexkepo</span>
      <span class="text-[10px] uppercase tracking-[.2em] text-white/85 hidden sm:inline">
        Japan's poké-fúta dex
      </span>
    </div>
  </a>

  <nav class="flex items-center gap-3 text-sm">
    {#if $auth}
      <a
        href="/me"
        class="rounded-full bg-white/20 px-3 py-1.5 font-semibold text-white backdrop-blur-sm hover:bg-white/30"
      >
        {$auth.user.pseudo}
      </a>
      <button
        class="rounded-full px-3 py-1.5 text-white/90 hover:bg-white/15"
        onclick={handleLogout}
      >
        logout
      </button>
    {:else}
      <a href="/login" class="text-white/90 hover:text-white hover:underline">login</a>
      <a
        href="/register"
        class="rounded-full bg-slate-900 px-4 py-1.5 font-semibold text-white shadow hover:bg-slate-800"
      >
        sign up
      </a>
    {/if}
  </nav>
</header>
