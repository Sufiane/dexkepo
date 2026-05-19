/**
 * Build a Pokemon Showdown sprite URL from a display name.
 *
 * Showdown slugs are aggressively normalized:
 *   - lowercase
 *   - all non-alphanumeric characters stripped (apostrophes, dots, spaces,
 *     hyphens, fancy quotes)
 *   - regional variants use a `-form` suffix (e.g. "Galarian Farfetch'd" ->
 *     "farfetchd-galar")
 *   - gendered Pokemon use a `-f` / `-m` suffix
 *
 * Source: https://play.pokemonshowdown.com/sprites/gen5/{slug}.png
 */

const REGIONAL_PREFIXES: Array<{ prefix: string; suffix: string }> = [
  { prefix: 'galarian ', suffix: '-galar' },
  { prefix: 'alolan ', suffix: '-alola' },
  { prefix: 'hisuian ', suffix: '-hisui' },
  { prefix: 'paldean ', suffix: '-paldea' },
];

function normalize(name: string): string {
  return name
    .toLowerCase()
    .replace(/[‘’]/g, "'") // smart quotes -> straight
    .replace(/[^a-z0-9\s-]/g, '') // drop apostrophes, dots, etc.
    .replace(/[\s-]+/g, '-') // collapse whitespace/dashes
    .replace(/^-+|-+$/g, ''); // trim
}

export function pokemonSlug(name: string): string {
  const lowered = name.toLowerCase();

  for (const { prefix, suffix } of REGIONAL_PREFIXES) {
    if (lowered.startsWith(prefix)) {
      const species = normalize(name.slice(prefix.length));

      // Showdown joins alphanumerics with no dash inside species names,
      // but variant suffixes are dash-separated.
      return species.replace(/-/g, '') + suffix;
    }
  }

  // Gendered Nidorans: "Nidoran ♀" / "Nidoran♀" / "Nidoran F" etc.
  if (lowered.includes('nidoran')) {
    if (name.includes('♀') || /\bf\b/i.test(name)) {
      return 'nidoranf';
    }

    if (name.includes('♂') || /\bm\b/i.test(name)) {
      return 'nidoranm';
    }
  }

  return normalize(name).replace(/-/g, '');
}

export function spriteUrl(name: string): string {
  return `https://play.pokemonshowdown.com/sprites/gen5/${pokemonSlug(name)}.png`;
}
