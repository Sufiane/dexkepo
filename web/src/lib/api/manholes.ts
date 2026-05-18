import type { Manhole, ManholeSummary } from '@dexkepo/shared';
import { api } from './client';

export function listManholes(): Promise<ManholeSummary[]> {
  return api<ManholeSummary[]>('/manholes');
}

export function getManhole(manholeNo: string): Promise<Manhole> {
  return api<Manhole>(`/manholes/${encodeURIComponent(manholeNo)}`);
}
