import { writable } from 'svelte/store';

export type Filters = {
  showVisited: boolean;
  showUnvisited: boolean;
  prefectures: string[]; // empty = all
  pokemonSearch: string; // exact pokemon name; empty = no search
};

export const filters = writable<Filters>({
  showVisited: true,
  showUnvisited: true,
  prefectures: [],
  pokemonSearch: '',
});
