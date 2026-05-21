import { Controller, Get, UseGuards } from '@nestjs/common';
import { AchievementStatus } from '@dexkepo/shared';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { AuthUser, CurrentUser } from '../common/current-user.decorator';
import { Locale } from '../common/locale';
import { RequestLocale } from '../common/locale.decorator';
import { AchievementsService } from './achievements.service';

@UseGuards(JwtAuthGuard)
@Controller('me/achievements')
export class AchievementsController {
  constructor(private svc: AchievementsService) {}

  @Get()
  list(
    @CurrentUser() user: AuthUser,
    @RequestLocale() locale: Locale,
  ): Promise<AchievementStatus[]> {
    return this.svc.listForUser(user.id, locale);
  }
}
