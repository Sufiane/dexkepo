import { Module } from '@nestjs/common';
import { DexController } from './dex.controller';
import { DexService } from './dex.service';
import { DexDb } from './dex.db';

@Module({
  controllers: [DexController],
  providers: [DexService, DexDb],
  exports: [DexService],
})
export class DexModule {}
