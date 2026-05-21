import { Module } from '@nestjs/common';
import { PokemonModule } from '../pokemon/pokemon.module';
import { ManholesController } from './manholes.controller';
import { ManholesService } from './manholes.service';
import { ManholesDb } from './manholes.db';

@Module({
  imports: [PokemonModule],
  controllers: [ManholesController],
  providers: [ManholesService, ManholesDb],
  exports: [ManholesService],
})
export class ManholesModule {}
