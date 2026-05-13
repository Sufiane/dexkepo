import { Controller, Delete, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { AuthUser, CurrentUser } from '../common/current-user.decorator';
import { DexService } from './dex.service';

@UseGuards(JwtAuthGuard)
@Controller('me/dex')
export class DexController {
  constructor(private svc: DexService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.svc.list(user.id);
  }

  @Post(':manholeNo')
  mark(@CurrentUser() user: AuthUser, @Param('manholeNo') manholeNo: string) {
    return this.svc.mark(user.id, manholeNo);
  }

  @Delete(':manholeNo')
  @HttpCode(204)
  unmark(@CurrentUser() user: AuthUser, @Param('manholeNo') manholeNo: string) {
    return this.svc.unmark(user.id, manholeNo);
  }
}
