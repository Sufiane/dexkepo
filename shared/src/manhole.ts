export type PokemonRef = {
  name: string;
  zukan_url: string;
};

/**
 * Detailed manhole shape returned from `GET /manholes/:no`.
 *
 * All locale-sensitive fields (`name`, `prefName`, `pokemon[].name`,
 * `city`, `address`) are pre-localised by the API based on the request's
 * `Accept-Language` header. The frontend just renders them.
 */
export type Manhole = {
  manholeNo: string;
  name: string;
  prefName: string;
  prefEnName: string;
  city: string;
  address: string;
  lat: number;
  lng: number;
  pictureUrl: string;
  pokemon: PokemonRef[];
};

/**
 * Slim shape returned by `GET /manholes`. Same locale rules as `Manhole`.
 *
 * `prefEnName` stays canonical (English slug) because it is used as a filter
 * key in the URL/state and must round-trip stably across locales.
 */
export type ManholeSummary = {
  manholeNo: string;
  name: string;
  prefEnName: string;
  lat: number;
  lng: number;
  pictureUrl: string;
  pokemonNames: string[];
};
