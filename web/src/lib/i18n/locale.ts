import { derived, writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Locale = 'en' | 'ja';

const KEY = 'dexkepo.locale';
const DEFAULT: Locale = 'en';

function load(): Locale {
  if (!browser) {
    return DEFAULT;
  }

  const stored = localStorage.getItem(KEY);

  if (stored === 'en' || stored === 'ja') {
    return stored;
  }

  // Soft auto-detect: Japanese browsers see JA by default.
  if (typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('ja')) {
    return 'ja';
  }

  return DEFAULT;
}

export const locale = writable<Locale>(load());

locale.subscribe((value) => {
  if (!browser) {
    return;
  }

  localStorage.setItem(KEY, value);
  document.documentElement.lang = value;
});

export function setLocale(next: Locale): void {
  locale.set(next);
}

export function toggleLocale(): void {
  locale.update((current) => (current === 'en' ? 'ja' : 'en'));
}

import { dict, type Dictionary } from './dictionary';

/** Reactive translator. Use as `$t('key.path')` inside Svelte templates. */
export const t = derived(locale, ($locale) => {
  const table = dict[$locale];

  return (path: string, vars?: Record<string, string | number>): string => {
    const raw = resolve(table, path) ?? resolve(dict.en, path) ?? path;

    if (!vars) {
      return raw;
    }

    return Object.entries(vars).reduce(
      (acc, [name, value]) => acc.replaceAll(`{${name}}`, String(value)),
      raw,
    );
  };
});

function resolve(table: Dictionary, path: string): string | undefined {
  const parts = path.split('.');
  let cursor: unknown = table;

  for (const part of parts) {
    if (cursor && typeof cursor === 'object' && part in cursor) {
      cursor = (cursor as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }

  return typeof cursor === 'string' ? cursor : undefined;
}
