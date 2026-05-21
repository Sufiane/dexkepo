import { writable } from 'svelte/store';

export type Filters = {
  showVisited: boolean;
  showUnvisited: boolean;
  prefectures: string[]; // empty = all
  pokemonSearch: string; // exact pokemon name; empty = no search
  legendaryOnly: boolean;
  mythicalOnly: boolean;
  unvisitedOnly: boolean;
};

const DEFAULTS: Filters = {
  showVisited: true,
  showUnvisited: true,
  prefectures: [],
  pokemonSearch: '',
  legendaryOnly: false,
  mythicalOnly: false,
  unvisitedOnly: false,
};

export const filters = writable<Filters>({ ...DEFAULTS });

/** Reset all filters to defaults. */
export function resetFilters(): void {
  filters.set({ ...DEFAULTS });
}

/** True when any filter narrows the catalogue (i.e. not at default state). */
export function isFiltered(state: Filters): boolean {
  return (
    state.prefectures.length > 0 ||
    state.pokemonSearch !== '' ||
    state.legendaryOnly ||
    state.mythicalOnly ||
    state.unvisitedOnly ||
    !state.showVisited ||
    !state.showUnvisited
  );
}
