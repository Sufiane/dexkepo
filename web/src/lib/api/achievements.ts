import type { AchievementStatus } from '@dexkepo/shared';
import { api } from './client';

export function listAchievements(): Promise<AchievementStatus[]> {
  return api<AchievementStatus[]>('/me/achievements', { auth: true });
}
