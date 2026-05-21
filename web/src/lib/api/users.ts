import type { UserPublic } from '@dexkepo/shared';
import { api } from './client';

export function getMe(): Promise<UserPublic> {
  return api<UserPublic>('/users/me', { auth: true });
}

export function updateProfile(patch: {
  publicProfile?: boolean;
  chosenFavorite?: string | null;
}): Promise<UserPublic> {
  return api<UserPublic>('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(patch),
    auth: true,
  });
}
