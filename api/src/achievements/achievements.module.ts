import { Module } from '@nestjs/common';
import { DexModule } from '../dex/dex.module';
import { ManholesModule } from '../manholes/manholes.module';
import { PokemonModule } from '../pokemon/pokemon.module';
import { AchievementsController } from './achievements.controller';
import { AchievementsService } from './achievements.service';
import { AchievementsDb } from './achievements.db';

@Module({
  imports: [DexModule, ManholesModule, PokemonModule],
  controllers: [AchievementsController],
  providers: [AchievementsService, AchievementsDb],
  exports: [AchievementsService],
})
export class AchievementsModule {}
