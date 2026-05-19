export type PokemonRef = {
  name: string;
  zukan_url: string;
};

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

// Slim shape returned by GET /manholes (list). Drop heavy fields so the
// payload for 470 rows stays small enough for tight-RAM hosts to buffer.
// pictureUrl is included so the popup can show the cover image instantly
// without waiting for the /manholes/:no detail fetch.
export type ManholeSummary = {
  manholeNo: string;
  name: string;
  prefEnName: string;
  lat: number;
  lng: number;
  pictureUrl: string;
};
