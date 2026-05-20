export type AchievementCategory = 'count' | 'geo' | 'time';

export type AchievementDefinition = {
  id: string;
  title: string;
  description: string;
  /** Single emoji or short glyph used as the badge icon. */
  icon: string;
  category: AchievementCategory;
};

export type AchievementProgress = {
  current: number;
  target: number;
};

export type AchievementStatus = AchievementDefinition & {
  unlocked: boolean;
  /** Only present for achievements that have a meaningful numerator/denominator. */
  progress?: AchievementProgress;
  /** ISO timestamp of the visit that first unlocked it, when computable. */
  unlockedAt?: string;
};
