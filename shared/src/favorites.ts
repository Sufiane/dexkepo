/**
 * A "favorite" Pokémon — ranked by how much of that Pokémon's pool the user
 * has visited (visited covers / total covers featuring it). Ratio beats raw
 * count because Pokémon with many covers would otherwise always look like
 * favorites just by virtue of being well-represented in the dataset.
 */
export type FavoritePokemon = {
  name: string;
  visitedCount: number;
  totalCount: number;
  /** visitedCount / totalCount, in [0, 1]. */
  ratio: number;
};

export type FavoritesResponse = {
  favorites: FavoritePokemon[];
  /**
   * True when the user has marked every cover. In that case ranking is
   * meaningless; if `chosenFavorite` is set, it is materialised as the single
   * entry in `favorites`. Otherwise `favorites` is empty and the UI shows
   * the "loves them all" message + a picker.
   */
  completedAll: boolean;
  /** User-pinned favorite Pokémon name. Null until they set one. */
  chosenFavorite: string | null;
};
