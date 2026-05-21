/**
 * Scrapes Japanese town + prefecture names from local.pokemon.jp's per-manhole
 * detail page and writes them onto the Manhole rows.
 *
 * Source: https://local.pokemon.jp/manhole/desc/{manholeNo}/
 * Format: <meta property="og:title" content="{prefJa}/{cityJa}｜ポケモン…"
 *
 * Run:
 *   cd api && npx ts-node --transpile-only prisma/enrich-manhole-ja.ts
 *
 * Idempotent: existing nameJa/prefNameJa are overwritten with the latest fetch
 * so re-running picks up any source corrections.
 */
import { PrismaClient } from '@prisma/client';

const BASE = 'https://local.pokemon.jp/manhole/desc';
const POLITE_MS = 250;
const MAX_RETRIES = 3;

type Parsed = { prefNameJa: string; nameJa: string };

const OG_TITLE_RE = /<meta\s+property="og:title"\s+content="([^"]+)"/i;
const PARSE_RE = /^([^/]+)\/([^｜]+)｜/;

async function fetchPage(manholeNo: string): Promise<string | null> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    const res = await fetch(`${BASE}/${manholeNo}/`, {
      headers: { 'Accept-Language': 'ja' },
    });

    if (res.ok) {
      return res.text();
    }

    if (res.status === 404) {
      return null;
    }

    await sleep(POLITE_MS * attempt);
  }

  return null;
}

function parse(html: string): Parsed | null {
  const meta = html.match(OG_TITLE_RE);

  if (!meta) {
    return null;
  }

  const parts = meta[1].match(PARSE_RE);

  if (!parts) {
    return null;
  }

  return {
    prefNameJa: parts[1].trim(),
    nameJa: parts[2].trim(),
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main(): Promise<void> {
  const prisma = new PrismaClient();

  try {
    const rows = await prisma.manhole.findMany({
      select: { manholeNo: true, name: true, prefName: true },
      orderBy: { manholeNo: 'asc' },
    });

    console.log(`Enriching ${rows.length} manholes…`);

    let ok = 0;
    let skipped = 0;

    for (const row of rows) {
      const html = await fetchPage(row.manholeNo);

      if (!html) {
        skipped += 1;
        console.warn(`  ⏭  #${row.manholeNo} (${row.name}, ${row.prefName}) — no page`);
        await sleep(POLITE_MS);
        continue;
      }

      const parsed = parse(html);

      if (!parsed) {
        skipped += 1;
        console.warn(`  ⚠️  #${row.manholeNo} (${row.name}, ${row.prefName}) — parse failed`);
        await sleep(POLITE_MS);
        continue;
      }

      await prisma.manhole.update({
        where: { manholeNo: row.manholeNo },
        data: parsed,
      });

      ok += 1;

      if (ok % 25 === 0) {
        console.log(`  ✓ ${ok}/${rows.length} (latest #${row.manholeNo}: ${parsed.prefNameJa}/${parsed.nameJa})`);
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
