import type { UserPublic } from '@dexkepo/shared';
import { api } from './client';

export function updateProfile(patch: {
  publicProfile?: boolean;
}): Promise<UserPublic> {
  return api<UserPublic>('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
}
