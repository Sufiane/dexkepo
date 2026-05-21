import { Controller, Get, Headers, Param, Query } from '@nestjs/common';
import { Manhole, ManholeSummary } from '@dexkepo/shared';
import { parseLocale } from '../common/locale';
import { ManholesService } from './manholes.service';

@Controller('manholes')
export class ManholesController {
  constructor(private svc: ManholesService) {}

  @Get()
  list(
    @Headers('accept-language') acceptLanguage: string | undefined,
    @Query('pref') pref?: string,
  ): Promise<ManholeSummary[]> {
    return this.svc.list(parseLocale(acceptLanguage), pref);
  }

  @Get(':manholeNo')
  one(
    @Headers('accept-language') acceptLanguage: string | undefined,
    @Param('manholeNo') manholeNo: string,
  ): Promise<Manhole> {
    return this.svc.one(parseLocale(acceptLanguage), manholeNo);
  }
}
