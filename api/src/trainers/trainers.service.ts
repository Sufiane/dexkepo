import { Injectable, NotFoundException } from '@nestjs/common';
import { TrainerProfile } from '@dexkepo/shared';
import { DexService } from '../dex/dex.service';
import { ManholesService } from '../manholes/manholes.service';
import { AchievementsService } from '../achievements/achievements.service';
import { FavoritesService } from '../favorites/favorites.service';
import { TrainersDb } from './trainers.db';

@Injectable()
export class TrainersService {
  constructor(
    private db: TrainersDb,
    private dexSvc: DexService,
    private manholesSvc: ManholesService,
    private achievementsSvc: AchievementsService,
    private favoritesSvc: FavoritesService,
  ) {}

  async profile(pseudo: string): Promise<TrainerProfile> {
    const trainer = await this.db.findByPseudo(pseudo);

    // Private and missing share the same 404 — no info leak.
    if (!trainer || !trainer.publicProfile) {
      throw new NotFoundException('trainer not found');
    }

    const [visits, allManholes, achievements, favorites] = await Promise.all([
      this.dexSvc.list(trainer.id),
      this.manholesSvc.list(),
      this.achievementsSvc.publicListForUser(trainer.id),
      this.favoritesSvc.listForUser(trainer.id),
    ]);

    return {
      pseudo: trainer.pseudo,
      memberSince: trainer.createdAt.toISOString(),
      visitedCount: visits.length,
      totalCount: allManholes.length,
      achievements,
      favorites: favorites.favorites,
      completedAll: favorites.completedAll,
    };
  }
}
