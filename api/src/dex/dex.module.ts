import { Module } from '@nestjs/common';
import { PokemonModule } from '../pokemon/pokemon.module';
import { DexController } from './dex.controller';
import { DexService } from './dex.service';
import { DexDb } from './dex.db';

@Module({
  imports: [PokemonModule],
  controllers: [DexController],
  providers: [DexService, DexDb],
  exports: [DexService],
})
export class DexModule {}
