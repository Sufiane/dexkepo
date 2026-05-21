import { Controller, Delete, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { DexEntry } from '@prisma/client';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { UserThrottlerGuard } from '../common/user-throttler.guard';
import { AuthUser, CurrentUser } from '../common/current-user.decorator';
import { Locale } from '../common/locale';
import { RequestLocale } from '../common/locale.decorator';
import { ManholeNoParam } from '../manholes/dto/manhole-no.param';
import { DexService } from './dex.service';
import { LocalisedDexEntry } from './dex.types';

// JWT first (populates req.user) → UserThrottlerGuard reads req.user.id.
@UseGuards(JwtAuthGuard, UserThrottlerGuard)
@SkipThrottle({ 'trainer-public': true })
@Controller('me/dex')
export class DexController {
  constructor(private svc: DexService) {}

  // Listing your own dex is a read — it shouldn't eat the write-budget.
  // Class already skips trainer-public; merged with this, GET skips all three.
  @SkipThrottle({ 'dex-burst': true, 'dex-sustained': true })
  @Get()
  list(
    @CurrentUser() user: AuthUser,
    @RequestLocale() locale: Locale,
  ): Promise<LocalisedDexEntry[]> {
    return this.svc.list(user.id, locale);
  }

  @Post(':manholeNo')
  mark(
    @CurrentUser() user: AuthUser,
    @Param() params: ManholeNoParam,
  ): Promise<DexEntry> {
    return this.svc.mark(user.id, params.manholeNo);
  }

  @Delete(':manholeNo')
  @HttpCode(204)
  unmark(
    @CurrentUser() user: AuthUser,
    @Param() params: ManholeNoParam,
  ): Promise<void> {
    return this.svc.unmark(user.id, params.manholeNo);
  }
}
