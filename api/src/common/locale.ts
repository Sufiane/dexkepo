/**
 * Tiny Accept-Language parser. The frontend sends just `en` or `ja` (no
 * weighted lists), so we don't need a real RFC-7231 parser.
 */
export type Locale = 'en' | 'ja';

export function parseLocale(header: string | undefined): Locale {
  if (!header) {
    return 'en';
  }

  const head = header.toLowerCase().split(',')[0]?.trim() ?? '';

  if (head.startsWith('ja')) {
    return 'ja';
  }

  return 'en';
}
