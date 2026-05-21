import type { Manhole as PublicManhole } from '@dexkepo/shared';

/**
 * Public shape for `GET /me/dex`. The DB row's joined Manhole is pre-localised
 * by DexService so the frontend just renders `manhole.name`, `manhole.prefName`
 * etc. as-is.
 */
export type LocalisedDexEntry = {
  userId: string;
  manholeNo: string;
  visitedAt: Date;
  manhole: PublicManhole;
};
