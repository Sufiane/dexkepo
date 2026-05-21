import { Controller, Get, Headers, Param, UseGuards } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { TrainerProfile } from '@dexkepo/shared';
import { TrainerPublicThrottlerGuard } from '../common/trainer-public-throttler.guard';
import { parseLocale } from '../common/locale';
import { TrainersService } from './trainers.service';

@Controller('trainers')
@UseGuards(TrainerPublicThrottlerGuard)
@SkipThrottle({ 'dex-burst': true, 'dex-sustained': true })
export class TrainersController {
  constructor(private svc: TrainersService) {}

  @Get(':pseudo')
  one(
    @Headers('accept-language') acceptLanguage: string | undefined,
    @Param('pseudo') pseudo: string,
  ): Promise<TrainerProfile> {
    return this.svc.profile(pseudo, parseLocale(acceptLanguage));
  }
}
