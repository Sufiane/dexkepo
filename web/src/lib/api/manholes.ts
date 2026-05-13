import type { Manhole } from '@dexkepo/shared';
import { api } from './client';

export function listManholes(): Promise<Manhole[]> {
  return api<Manhole[]>('/manholes');
}
