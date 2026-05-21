import { Controller, Get, Headers, UseGuards } from '@nestjs/common';
import { AchievementStatus } from '@dexkepo/shared';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { AuthUser, CurrentUser } from '../common/current-user.decorator';
import { parseLocale } from '../common/locale';
import { AchievementsService } from './achievements.service';

@UseGuards(JwtAuthGuard)
@Controller('me/achievements')
export class AchievementsController {
  constructor(private svc: AchievementsService) {}

  @Get()
  list(
    @CurrentUser() user: AuthUser,
    @Headers('accept-language') acceptLanguage: string | undefined,
  ): Promise<AchievementStatus[]> {
    return this.svc.listForUser(user.id, parseLocale(acceptLanguage));
  }
}
