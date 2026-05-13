import type { Manhole } from './manhole';

export type DexEntry = {
  userId: string;
  manholeNo: string;
  visitedAt: string;
};

export type DexEntryWithManhole = DexEntry & {
  manhole: Manhole;
};
