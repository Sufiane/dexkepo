import { Controller, Get, Param, Query } from '@nestjs/common';
import { Manhole, ManholeSummary } from '@dexkepo/shared';
import { Locale } from '../common/locale';
import { RequestLocale } from '../common/locale.decorator';
import { ListManholesQuery } from './dto/list-manholes.dto';
import { ManholeNoParam } from './dto/manhole-no.param';
import { ManholesService } from './manholes.service';

@Controller('manholes')
export class ManholesController {
  constructor(private svc: ManholesService) {}

  @Get()
  list(
    @RequestLocale() locale: Locale,
    @Query() query: ListManholesQuery,
  ): Promise<ManholeSummary[]> {
    return this.svc.list(locale, query.pref);
  }

  @Get(':manholeNo')
  one(
    @RequestLocale() locale: Locale,
    @Param() params: ManholeNoParam,
  ): Promise<Manhole> {
    return this.svc.one(locale, params.manholeNo);
  }
}
