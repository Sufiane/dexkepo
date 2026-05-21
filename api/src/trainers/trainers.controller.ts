import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { TrainerProfile } from '@dexkepo/shared';
import { TrainerPublicThrottlerGuard } from '../common/trainer-public-throttler.guard';
import { Locale } from '../common/locale';
import { RequestLocale } from '../common/locale.decorator';
import { TrainersService } from './trainers.service';

@Controller('trainers')
@UseGuards(TrainerPublicThrottlerGuard)
@SkipThrottle({ 'dex-burst': true, 'dex-sustained': true })
export class TrainersController {
  constructor(private svc: TrainersService) {}

  @Get(':pseudo')
  one(
    @RequestLocale() locale: Locale,
    @Param('pseudo') pseudo: string,
  ): Promise<TrainerProfile> {
    return this.svc.profile(pseudo, locale);
  }
}
