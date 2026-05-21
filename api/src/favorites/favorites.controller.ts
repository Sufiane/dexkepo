import { Controller, Get, UseGuards } from '@nestjs/common';
import { FavoritesResponse } from '@dexkepo/shared';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { AuthUser, CurrentUser } from '../common/current-user.decorator';
import { Locale } from '../common/locale';
import { RequestLocale } from '../common/locale.decorator';
import { FavoritesService } from './favorites.service';

@UseGuards(JwtAuthGuard)
@Controller('me/favorites')
export class FavoritesController {
  constructor(private svc: FavoritesService) {}

  @Get()
  list(
    @CurrentUser() user: AuthUser,
    @RequestLocale() locale: Locale,
  ): Promise<FavoritesResponse> {
    return this.svc.listForUser(user.id, locale);
  }
}
