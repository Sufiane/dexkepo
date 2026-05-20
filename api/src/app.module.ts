import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ManholesModule } from './manholes/manholes.module';
import { DexModule } from './dex/dex.module';
import { HealthModule } from './health/health.module';
import { AchievementsModule } from './achievements/achievements.module';
import { FavoritesModule } from './favorites/favorites.module';
import { TrainersModule } from './trainers/trainers.module';

const ONE_MINUTE_MS = 60_000;
const ONE_HOUR_MS = 60 * ONE_MINUTE_MS;

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Three-tier rate limit. Buckets are global to the app; only routes that
    // attach UserThrottlerGuard or TrainerPublicThrottlerGuard get protected.
    // See dex.controller.ts and trainers.controller.ts.
    //   burst:           10 requests / minute  → lets a day-trip log batch through
    //   sustained:       60 requests / hour    → caps script farming at ~8h for all 470 covers
    //   trainer-public:  60 requests / minute  → IP-keyed for anonymous trainer endpoint
    ThrottlerModule.forRoot([
      { name: 'dex-burst', ttl: ONE_MINUTE_MS, limit: 10 },
      { name: 'dex-sustained', ttl: ONE_HOUR_MS, limit: 60 },
      { name: 'trainer-public', ttl: ONE_MINUTE_MS, limit: 60 },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    ManholesModule,
    DexModule,
    HealthModule,
    AchievementsModule,
    FavoritesModule,
    TrainersModule,
  ],
})
export class AppModule {}
