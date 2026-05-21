import type { Manhole, ManholeSummary } from '@dexkepo/shared';
import { api } from './client';

export function listManholes(pref?: string): Promise<ManholeSummary[]> {
  const path = pref ? `/manholes?pref=${encodeURIComponent(pref)}` : '/manholes';

  return api<ManholeSummary[]>(path);
}

export function getManhole(manholeNo: string): Promise<Manhole> {
  return api<Manhole>(`/manholes/${encodeURIComponent(manholeNo)}`);
}
