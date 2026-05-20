<script lang="ts">
  import { auth, patchUser } from '$lib/stores/auth';
  import { updateProfile } from '$lib/api/users';

  let saving = $state(false);
  let copied = $state(false);
  let errorMsg = $state('');

  const isPublic = $derived($auth?.user.publicProfile ?? false);
  const profileUrl = $derived(
    $auth ? `${location.origin}/trainer/${$auth.user.pseudo}` : '',
  );

  async function toggle(): Promise<void> {
    if (!$auth) {
      return;
    }

    saving = true;
    errorMsg = '';

    try {
      const updated = await updateProfile({ publicProfile: !isPublic });

      patchUser({ publicProfile: updated.publicProfile });
    } catch (err) {
      errorMsg = err instanceof Error ? err.message : 'Could not save';
    } finally {
      saving = false;
    }
  }

  async function copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(profileUrl);
      copied = true;
      setTimeout(() => {
        copied = false;
      }, 1500);
    } catch {
      errorMsg = 'Clipboard unavailable';
    }
  }
</script>

<section class="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-800">
  <div class="flex items-start justify-between gap-3">
    <div>
      <h2 class="text-base font-extrabold text-slate-900 dark:text-slate-100">
        Public profile
      </h2>
      <p class="mt-1 text-xs text-slate-500">
        Share your dex with a link. Toggle off to keep it private — visitors
        will see a "not found" page.
      </p>
    </div>

    <button
      type="button"
      onclick={toggle}
      disabled={saving}
      class={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors disabled:opacity-50 ${isPublic ? 'bg-rose-500' : 'bg-slate-300 dark:bg-slate-600'}`}
      aria-pressed={isPublic}
      aria-label="Toggle public profile"
    >
      <span
        class={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${isPublic ? 'left-[22px]' : 'left-0.5'}`}
      ></span>
    </button>
  </div>

  <div class="mt-3 flex items-center gap-2">
    <input
      type="text"
      readonly
      value={profileUrl}
      class="min-w-0 flex-1 truncate rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
    />
    <button
      type="button"
      onclick={copy}
      disabled={!isPublic}
      class="rounded-lg bg-slate-900 px-3 py-1 text-xs font-bold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
      title={isPublic ? 'Copy link' : 'Enable public profile first'}
    >
      {copied ? 'Copied!' : 'Copy link'}
    </button>
  </div>

  {#if errorMsg}
    <p class="mt-2 text-xs text-rose-500">{errorMsg}</p>
  {/if}
</section>
