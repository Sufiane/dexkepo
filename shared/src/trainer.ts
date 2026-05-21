import type { AchievementCategory } from './achievements';
import type { FavoritePokemon } from './favorites';

export type PublicAchievement = {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  unlockedAt: string;
};

export type TrainerProfile = {
  pseudo: string;
  memberSince: string;
  visitedCount: number;
  totalCount: number;
  achievements: PublicAchievement[];
  favorites: FavoritePokemon[];
  /** True once visitedCount === totalCount. UI swaps the favorites podium. */
  completedAll: boolean;
};
