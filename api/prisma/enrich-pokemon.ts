/**
 * One-off enrichment: fetches PokeAPI for every unique Pokemon name that
 * appears on a manhole cover and populates the Pokemon table.
 *
 * Idempotent — re-running upserts. Stale rows are not deleted so removing a
 * Pokemon from the source data won't accidentally wipe it.
 *
 * Run with:  npm --workspace api exec -- ts-node --transpile-only prisma/enrich-pokemon.ts
 */
import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';

type SourceManhole = {
  pokemon_list: { name: string; zukan_url: string }[];
};

type PokeApiSpecies = {
  id: number;
  is_legendary: boolean;
  is_mythical: boolean;
  generation: { url: string };
};

type PokeApiPokemon = {
  types: { slot: number; type: { name: string } }[];
};

const prisma = new PrismaClient();

const REGIONAL_PREFIXES: Array<{ prefix: string; suffix: string }> = [
  { prefix: 'galarian ', suffix: '-galar' },
  { prefix: 'alolan ', suffix: '-alola' },
  { prefix: 'hisuian ', suffix: '-hisui' },
  { prefix: 'paldean ', suffix: '-paldea' },
];

function stripAccents(input: string): string {
  return input.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function pokemonSlug(name: string): string {
  const lowered = stripAccents(name).toLowerCase();

  for (const { prefix, suffix } of REGIONAL_PREFIXES) {
    if (lowered.startsWith(prefix)) {
      const species = lowered
        .slice(prefix.length)
        .replace(/[‘’']/g, '')
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');

      return species.replace(/-/g, '') + suffix;
    }
  }

  if (lowered.includes('nidoran')) {
    if (name.includes('♀') || /\bf\b/i.test(name)) {
      return 'nidoran-f';
    }

    if (name.includes('♂') || /\bm\b/i.test(name)) {
      return 'nidoran-m';
    }
  }

  return lowered
    .replace(/[‘’']/g, '')
    .replace(/\./g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function generationFromUrl(url: string): number {
  // e.g. https://pokeapi.co/api/v2/generation/2/
  const match = url.match(/\/generation\/(\d+)\/?$/);
  return match ? Number(match[1]) : 0;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`${url} -> ${res.status}`);
  }

  return res.json() as Promise<T>;
}

type PokeApiPokemonFull = PokeApiPokemon & {
  id: number;
  species: { url: string };
};

type PokeApiSpeciesFull = PokeApiSpecies & {
  varieties: { is_default: boolean; pokemon: { name: string; url: string } }[];
};

/**
 * Some species (Aegislash, Darmanitan, Lycanroc…) don't respond on
 * /pokemon/{slug} because PokeAPI only exposes their form variants. Fall back
 * to /pokemon-species/{slug} → varieties[is_default].pokemon.url which always
 * resolves.
 */
async function fetchPokemonRecord(slug: string): Promise<{
  pokemon: PokeApiPokemonFull;
  species: PokeApiSpeciesFull;
}> {
  try {
    const pokemon = await fetchJson<PokeApiPokemonFull>(
      `https://pokeapi.co/api/v2/pokemon/${slug}`,
    );
    const species = await fetchJson<PokeApiSpeciesFull>(pokemon.species.url);

    return { pokemon, species };
  } catch {
    // Form-only species — look up the species first, then its default variety.
    const species = await fetchJson<PokeApiSpeciesFull>(
      `https://pokeapi.co/api/v2/pokemon-species/${slug}`,
    );
    const defaultVariety =
      species.varieties.find((variety) => variety.is_default) ?? species.varieties[0];

    if (!defaultVariety) {
      throw new Error(`no default variety for ${slug}`);
    }

    const pokemon = await fetchJson<PokeApiPokemonFull>(defaultVariety.pokemon.url);

    return { pokemon, species };
  }
}

async function enrich(name: string): Promise<void> {
  const slug = pokemonSlug(name);
  const { pokemon, species } = await fetchPokemonRecord(slug);

  const types = pokemon.types
    .sort((a, b) => a.slot - b.slot)
    .map((entry) => entry.type.name);

  const data = {
    pokeApiId: pokemon.id,
    types,
    isLegendary: species.is_legendary,
    isMythical: species.is_mythical,
    generation: generationFromUrl(species.generation.url),
  };

  await prisma.pokemon.upsert({
    where: { name },
    create: { name, ...data },
    update: data,
  });
}

async function main(): Promise<void> {
  const file = join(__dirname, '..', 'data', 'manholes.json');
  const rows = JSON.parse(readFileSync(file, 'utf8')) as SourceManhole[];

  const unique = new Set<string>();
  for (const manhole of rows) {
    for (const pokemon of manhole.pokemon_list) {
      unique.add(pokemon.name);
    }
  }

  const names = [...unique].sort();
  console.log(`Enriching ${names.length} unique Pokemon...`);

  let done = 0;
  let failed = 0;
  const failures: string[] = [];

  // Concurrency: PokeAPI is generous but we still rate-limit ourselves;
  // also avoids two parallel upserts colliding when two near-duplicate
  // source names resolve to the same row.
  const concurrency = 2;

  for (let index = 0; index < names.length; index += concurrency) {
    const batch = names.slice(index, index + concurrency);

    await Promise.all(
      batch.map(async (name) => {
        try {
          await enrich(name);
          done += 1;
        } catch (error) {
          failed += 1;
          failures.push(`${name}: ${(error as Error).message}`);
        }
      }),
    );

    if ((index + concurrency) % 50 === 0 || index + concurrency >= names.length) {
      console.log(`  ${Math.min(index + concurrency, names.length)} / ${names.length}`);
    }
  }

  console.log(`\nDone. ok=${done}  failed=${failed}`);

  if (failures.length) {
    console.log('\nFailures:');
    for (const failure of failures) {
      console.log(`  ${failure}`);
    }
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
