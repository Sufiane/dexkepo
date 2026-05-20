import { Injectable } from '@nestjs/common';
import { UnlockedAchievement } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Data access for sticky achievement unlocks. The only file in this module
 * that imports Prisma.
 *
 * Inserts are idempotent thanks to the composite PK (userId, achievementId)
 * combined with `update: {}` — once a badge is earned, its unlockedAt never
 * changes and re-running evaluation is safe.
 */
@Injectable()
export class AchievementsDb {
  constructor(private prisma: PrismaService) {}

  findUnlockedForUser(userId: string): Promise<UnlockedAchievement[]> {
    return this.prisma.unlockedAchievement.findMany({ where: { userId } });
  }

  upsertUnlocked(
    userId: string,
    achievementId: string,
    unlockedAt?: Date,
  ): Promise<UnlockedAchievement> {
    return this.prisma.unlockedAchievement.upsert({
      where: { userId_achievementId: { userId, achievementId } },
      create: {
        userId,
        achievementId,
        ...(unlockedAt ? { unlockedAt } : {}),
      },
      update: {}, // never overwrite the original unlockedAt
    });
  }
}
