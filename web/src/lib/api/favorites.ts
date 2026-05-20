import type { FavoritesResponse } from '@dexkepo/shared';
import { api } from './client';

export function getFavorites(): Promise<FavoritesResponse> {
  return api<FavoritesResponse>('/me/favorites', { auth: true });
}
