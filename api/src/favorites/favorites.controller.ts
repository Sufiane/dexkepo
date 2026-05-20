import { Controller, Get, UseGuards } from '@nestjs/common';
import { FavoritesResponse } from '@dexkepo/shared';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { AuthUser, CurrentUser } from '../common/current-user.decorator';
import { FavoritesService } from './favorites.service';

@UseGuards(JwtAuthGuard)
@Controller('me/favorites')
export class FavoritesController {
  constructor(private svc: FavoritesService) {}

  @Get()
  list(@CurrentUser() user: AuthUser): Promise<FavoritesResponse> {
    return this.svc.listForUser(user.id);
  }
}
