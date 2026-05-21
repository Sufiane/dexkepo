import { Controller, Get, Headers, UseGuards } from '@nestjs/common';
import { FavoritesResponse } from '@dexkepo/shared';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { AuthUser, CurrentUser } from '../common/current-user.decorator';
import { parseLocale } from '../common/locale';
import { FavoritesService } from './favorites.service';

@UseGuards(JwtAuthGuard)
@Controller('me/favorites')
export class FavoritesController {
  constructor(private svc: FavoritesService) {}

  @Get()
  list(
    @CurrentUser() user: AuthUser,
    @Headers('accept-language') acceptLanguage: string | undefined,
  ): Promise<FavoritesResponse> {
    return this.svc.listForUser(user.id, parseLocale(acceptLanguage));
  }
}
