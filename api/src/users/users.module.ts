import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersDb } from './users.db';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UsersDb],
  exports: [UsersService],
})
export class UsersModule {}
