import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

type RequestLike = { user?: { id?: string }; ip?: string };

/**
 * Per-user throttler. The default ThrottlerGuard tracks by IP, which is the
 * wrong key for us: behind Cloudflare → Back4App many users share an egress
 * IP and would exhaust each other's quota.
 *
 * JwtAuthGuard runs before this one (declared first in @UseGuards) so
 * `req.user.id` is populated. Falls back to `req.ip` for unauthenticated
 * requests, though the JWT guard would have rejected them already.
 */
@Injectable()
export class UserThrottlerGuard extends ThrottlerGuard {
  protected getTracker(req: RequestLike): Promise<string> {
    return Promise.resolve(req.user?.id ?? req.ip ?? 'unknown');
  }
}
