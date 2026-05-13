import type { DexEntry, DexEntryWithManhole } from '@dexkepo/shared';
import { api } from './client';

export function listDex(): Promise<DexEntryWithManhole[]> {
  return api<DexEntryWithManhole[]>('/me/dex', { auth: true });
}

export function markVisited(manholeNo: string): Promise<DexEntry> {
  return api<DexEntry>(`/me/dex/${encodeURIComponent(manholeNo)}`, { method: 'POST', auth: true });
}

export function unmarkVisited(manholeNo: string): Promise<void> {
  return api<void>(`/me/dex/${encodeURIComponent(manholeNo)}`, { method: 'DELETE', auth: true });
}
