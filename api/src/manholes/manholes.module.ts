import { Module } from '@nestjs/common';
import { ManholesController } from './manholes.controller';
import { ManholesService } from './manholes.service';
import { ManholesDb } from './manholes.db';

@Module({
  controllers: [ManholesController],
  providers: [ManholesService, ManholesDb],
})
export class ManholesModule {}
