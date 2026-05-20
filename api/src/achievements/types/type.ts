import { AchievementDefinition } from '@dexkepo/shared';
import { Pokemon } from '@prisma/client';
import { DexEntryWithManhole } from '../../dex/dex.db';
import { EvaluationOutcome, EvaluatorMap } from '../evaluator';

// ---- Config -------------------------------------------------------------

/** Covers needed featuring a given type to unlock that type's "fan" badge. */
const TYPE_FAN_THRESHOLD = 5;

/** Every type slug PokeAPI exposes for our dataset (excluding 'unknown'/'shadow'). */
const ALL_TYPES = [
  'normal',
  'fire',
  'water',
  'electric',
  'grass',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
  'dark',
  'steel',
  'fairy',
];

/** Iconic types we give individual "fan" badges to. The rest are covered by Rainbow. */
const FEATURED_TYPE_BADGES: Array<{
  type: string;
  id: string;
  title: string;
  icon: string;
}> = [
  { type: 'fire', id: 'fire-fan', title: 'Fire-type fan', icon: '🔥' },
  { type: 'water', id: 'water-fan', title: 'Water-type fan', icon: '💧' },
  { type: 'grass', id: 'grass-fan', title: 'Grass-type fan', icon: '🌿' },
  { type: 'electric', id: 'electric-fan', title: 'Electric-type fan', icon: '⚡' },
  { type: 'dragon', id: 'dragon-master', title: 'Dragon master', icon: '🐉' },
  { type: 'ghost', id: 'ghost-hunter', title: 'Ghost hunter', icon: '👻' },
  { type: 'fairy', id: 'fairy-collector', title: 'Fairy collector', icon: '🧚' },
];

// ---- Definitions ---------------------------------------------------------

export const typeDefinitions: AchievementDefinition[] = [
  {
    id: 'rainbow',
    title: 'Rainbow',
    description: `Visit a cover featuring every one of the ${ALL_TYPES.length} Pokémon types.`,
    icon: '🌈',
    category: 'type',
  },
  ...FEATURED_TYPE_BADGES.map(
    ({ id, title, icon, type }): AchievementDefinition => ({
      id,
      title,
      description: `Visit ${TYPE_FAN_THRESHOLD} covers featuring a ${type}-type Pokémon.`,
      icon,
      category: 'type',
    }),
  ),
];

// ---- Helpers -------------------------------------------------------------

/** Set of all type slugs reachable from the user's currently-visited covers. */
function typesReachedByVisits(
  visits: DexEntryWithManhole[],
  pokemonByName: Map<string, Pokemon>,
): Set<string> {
  const reached = new Set<string>();

  for (const entry of visits) {
    const pokemonOnCover = entry.manhole.pokemon as unknown as { name: string }[] | null;

    for (const pokemon of pokemonOnCover ?? []) {
      const meta = pokemonByName.get(pokemon.name);

      if (!meta) {
        continue;
      }

      for (const typeSlug of meta.types) {
        reached.add(typeSlug);
      }
    }
  }

  return reached;
}

/** Count of distinct covers featuring at least one Pokémon of the given type. */
function coversWithType(
  visits: DexEntryWithManhole[],
  pokemonByName: Map<string, Pokemon>,
  targetType: string,
): number {
  let count = 0;

  for (const entry of visits) {
    const pokemonOnCover = entry.manhole.pokemon as unknown as { name: string }[] | null;
    const hit = (pokemonOnCover ?? []).some((pokemon) => {
      const meta = pokemonByName.get(pokemon.name);

      return meta?.types.includes(targetType) ?? false;
    });

    if (hit) {
      count += 1;
    }
  }

  return count;
}

// ---- Evaluators ----------------------------------------------------------

function rainbow(
  visits: DexEntryWithManhole[],
  pokemonByName: Map<string, Pokemon>,
): EvaluationOutcome {
  const reached = typesReachedByVisits(visits, pokemonByName);
  const current = reached.size;
  const target = ALL_TYPES.length;

  return {
    unlocked: current >= target,
    progress: { current, target },
  };
}

function typeFan(
  visits: DexEntryWithManhole[],
  pokemonByName: Map<string, Pokemon>,
  targetType: string,
): EvaluationOutcome {
  const current = coversWithType(visits, pokemonByName, targetType);

  return {
    unlocked: current >= TYPE_FAN_THRESHOLD,
    progress: { current: Math.min(current, TYPE_FAN_THRESHOLD), target: TYPE_FAN_THRESHOLD },
  };
}

export const typeEvaluators: EvaluatorMap = {
  rainbow: (ctx) => rainbow(ctx.visits, ctx.pokemonByName),
  ...Object.fromEntries(
    FEATURED_TYPE_BADGES.map(({ id, type }) => [
      id,
      (ctx: { visits: DexEntryWithManhole[]; pokemonByName: Map<string, Pokemon> }) =>
        typeFan(ctx.visits, ctx.pokemonByName, type),
    ]),
  ),
};
