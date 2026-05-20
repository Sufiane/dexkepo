import { Controller, Get, UseGuards } from '@nestjs/common';
import { AchievementStatus } from '@dexkepo/shared';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { AuthUser, CurrentUser } from '../common/current-user.decorator';
import { AchievementsService } from './achievements.service';

@UseGuards(JwtAuthGuard)
@Controller('me/achievements')
export class AchievementsController {
  constructor(private svc: AchievementsService) {}

  @Get()
  list(@CurrentUser() user: AuthUser): Promise<AchievementStatus[]> {
    return this.svc.listForUser(user.id);
  }
}
