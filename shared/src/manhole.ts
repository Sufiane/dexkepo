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
