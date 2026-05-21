import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Locale, parseLocale } from './locale';

/**
 * Reads `Accept-Language` from the request and returns a closed-enum
 * `Locale`. Defaults to `'en'` for missing / unknown values, so handlers
 * never need to null-check.
 *
 * Replaces the verbose `@Headers('accept-language')` + manual parse pattern
 * at every controller.
 */
export const RequestLocale = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Locale => {
    const req = ctx.switchToHttp().getRequest<{ headers?: Record<string, string | string[]> }>();
    const raw = req.headers?.['accept-language'];
    const header = Array.isArray(raw) ? raw[0] : raw;

    return parseLocale(header);
  },
);
