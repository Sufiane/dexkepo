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

export const filters = writable<Filters>({
  showVisited: true,
  showUnvisited: true,
  prefectures: [],
  pokemonSearch: '',
  legendaryOnly: false,
  mythicalOnly: false,
  unvisitedOnly: false,
});
