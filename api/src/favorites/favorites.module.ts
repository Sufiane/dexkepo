import { Module } from '@nestjs/common';
import { DexModule } from '../dex/dex.module';
import { ManholesModule } from '../manholes/manholes.module';
import { UsersModule } from '../users/users.module';
import { PokemonModule } from '../pokemon/pokemon.module';
import { FavoritesController } from './favorites.controller';
import { FavoritesService } from './favorites.service';

@Module({
  imports: [DexModule, ManholesModule, UsersModule, PokemonModule],
  controllers: [FavoritesController],
  providers: [FavoritesService],
  exports: [FavoritesService],
})
export class FavoritesModule {}
