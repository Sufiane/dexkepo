import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'dexkepo.theme';

function loadInitial(): Theme {
  if (!browser) {
    return 'light';
  }

  const stored = localStorage.getItem(STORAGE_KEY);

  if (stored === 'light' || stored === 'dark') {
    return stored;
  }

  // Fall back to the user's OS preference on first visit.
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyToDom(theme: Theme): void {
  if (!browser) {
    return;
  }

  document.documentElement.classList.toggle('dark', theme === 'dark');
}

export const theme = writable<Theme>(loadInitial());

theme.subscribe((value) => {
  if (!browser) {
    return;
  }

  localStorage.setItem(STORAGE_KEY, value);
  applyToDom(value);
});

export function toggleTheme(): void {
  theme.update((current) => (current === 'dark' ? 'light' : 'dark'));
}
