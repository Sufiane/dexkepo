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
   * True when the user has marked every cover. In that case favorites is
   * empty because every Pokémon would tie at 100% and ranking is meaningless.
   */
  completedAll: boolean;
};
