import { Module } from '@nestjs/common';
import { DexModule } from '../dex/dex.module';
import { ManholesModule } from '../manholes/manholes.module';
import { AchievementsModule } from '../achievements/achievements.module';
import { FavoritesModule } from '../favorites/favorites.module';
import { TrainersController } from './trainers.controller';
import { TrainersService } from './trainers.service';
import { TrainersDb } from './trainers.db';

@Module({
  imports: [DexModule, ManholesModule, AchievementsModule, FavoritesModule],
  controllers: [TrainersController],
  providers: [TrainersService, TrainersDb],
})
export class TrainersModule {}
