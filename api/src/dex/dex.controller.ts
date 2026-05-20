import { Controller, Delete, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { DexEntry } from '@prisma/client';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { UserThrottlerGuard } from '../common/user-throttler.guard';
import { AuthUser, CurrentUser } from '../common/current-user.decorator';
import { DexService } from './dex.service';
import { DexEntryWithManhole } from './dex.db';

// JWT first (populates req.user) → UserThrottlerGuard reads req.user.id.
@UseGuards(JwtAuthGuard, UserThrottlerGuard)
@SkipThrottle({ 'trainer-public': true })
@Controller('me/dex')
export class DexController {
  constructor(private svc: DexService) {}

  // Listing your own dex is a read — it shouldn't eat the write-budget.
  @SkipThrottle()
  @Get()
  list(@CurrentUser() user: AuthUser): Promise<DexEntryWithManhole[]> {
    return this.svc.list(user.id);
  }

  @Post(':manholeNo')
  mark(
    @CurrentUser() user: AuthUser,
    @Param('manholeNo') manholeNo: string,
  ): Promise<DexEntry> {
    return this.svc.mark(user.id, manholeNo);
  }

  @Delete(':manholeNo')
  @HttpCode(204)
  unmark(
    @CurrentUser() user: AuthUser,
    @Param('manholeNo') manholeNo: string,
  ): Promise<void> {
    return this.svc.unmark(user.id, manholeNo);
  }
}
