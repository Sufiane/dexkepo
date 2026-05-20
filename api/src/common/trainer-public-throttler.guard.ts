import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

type RequestLike = { ip?: string };

/**
 * IP-keyed throttler for the anonymous public-profile endpoint. There's no
 * JWT here — anything that reaches this guard is by definition unauthenticated.
 * Distinct from UserThrottlerGuard which expects req.user.
 */
@Injectable()
export class TrainerPublicThrottlerGuard extends ThrottlerGuard {
  protected getTracker(req: RequestLike): Promise<string> {
    return Promise.resolve(req.ip ?? 'unknown');
  }
}
