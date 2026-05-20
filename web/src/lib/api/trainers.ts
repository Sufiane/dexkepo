import type { TrainerProfile } from '@dexkepo/shared';
import { api } from './client';

export function getTrainer(pseudo: string): Promise<TrainerProfile> {
  return api<TrainerProfile>(`/trainers/${encodeURIComponent(pseudo)}`);
}
