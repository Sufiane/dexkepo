import { writable } from 'svelte/store';

export type Filters = {
  showVisited: boolean;
  showUnvisited: boolean;
  prefectures: string[]; // empty = all
};

export const filters = writable<Filters>({
  showVisited: true,
  showUnvisited: true,
  prefectures: []
});
