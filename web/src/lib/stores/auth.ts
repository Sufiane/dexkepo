import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { AuthResponse, UserPublic } from '@dexkepo/shared';

const KEY = 'dexkepo.auth';

type AuthState = { token: string; user: UserPublic } | null;

function load(): AuthState {
  if (!browser) return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthState;
  } catch {
    return null;
  }
}

export const auth = writable<AuthState>(load());

auth.subscribe((value) => {
  if (!browser) return;
  if (value) localStorage.setItem(KEY, JSON.stringify(value));
  else localStorage.removeItem(KEY);
});

export function setAuth(res: AuthResponse) {
  auth.set({ token: res.accessToken, user: res.user });
}

export function logout() {
  auth.set(null);
}
