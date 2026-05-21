import { Module } from '@nestjs/common';
import { PokemonModule } from '../pokemon/pokemon.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersDb } from './users.db';

@Module({
  imports: [PokemonModule],
  controllers: [UsersController],
  providers: [UsersService, UsersDb],
  exports: [UsersService],
})
export class UsersModule {}
