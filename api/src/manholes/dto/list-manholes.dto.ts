import { IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * Query shape for `GET /manholes`. `pref` is matched against the lowercased
 * `prefEnName` slug (e.g. `kagoshima`), so it stays short and ASCII.
 */
export class ListManholesQuery {
  @IsOptional()
  @IsString()
  @MaxLength(32)
  pref?: string;
}
