/**
 * One-off enrichment: fetches Japanese (katakana) names for every Pokemon
 * already in the DB. Uses PokeAPI's pokemon-species endpoint, which exposes
 * a `names[]` array with one entry per language. We pick `ja-Hrkt`
 * (katakana) — the conventional Japanese form for Pokémon names.
 *
 * Idempotent. Re-running overwrites `nameJa` with the freshest fetch.
 *
 * Run with:
 *   cd api && npx ts-node --transpile-only prisma/enrich-pokemon-ja.ts
 */
import { PrismaClient } from '@prisma/client';

const POLITE_MS = 150;
const MAX_RETRIES = 3;

type Species = {
  names: { language: { name: string }; name: string }[];
};

const prisma = new PrismaClient();

async function fetchSpecies(id: number): Promise<Species | null> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}/`);

    if (res.ok) {
      return (await res.json()) as Species;
    }

    if (res.status === 404) {
      return null;
    }

    await sleep(POLITE_MS * attempt);
  }

  return null;
}

function pickJa(species: Species): string | null {
  // Katakana first; fall back to hiragana if some species only ship that.
  const katakana = species.names.find((entry) => entry.language.name === 'ja-Hrkt');

  if (katakana) {
    return katakana.name;
  }

  const hiragana = species.names.find((entry) => entry.language.name === 'ja');

  return hiragana?.name ?? null;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main(): Promise<void> {
  try {
    const rows = await prisma.pokemon.findMany({
      select: { name: true, pokeApiId: true },
      orderBy: { pokeApiId: 'asc' },
    });

    console.log(`Enriching ${rows.length} pokémon…`);

    let ok = 0;
    let skipped = 0;

    for (const row of rows) {
      const species = await fetchSpecies(row.pokeApiId);

      if (!species) {
        skipped += 1;
        console.warn(`  ⏭  ${row.name} (id ${row.pokeApiId}) — no species`);
        await sleep(POLITE_MS);
        continue;
      }

      const nameJa = pickJa(species);

      if (!nameJa) {
        skipped += 1;
        console.warn(`  ⚠️  ${row.name} (id ${row.pokeApiId}) — no JA name`);
        await sleep(POLITE_MS);
        continue;
      }

      await prisma.pokemon.update({
        where: { name: row.name },
        data: { nameJa },
      });

      ok += 1;

      if (ok % 25 === 0) {
        console.log(`  ✓ ${ok}/${rows.length} (latest ${row.name} → ${nameJa})`);
      }

      await sleep(POLITE_MS);
    }

    console.log(`\nDone. Enriched: ${ok}, skipped: ${skipped}.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
