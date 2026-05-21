import { IsString, Matches } from 'class-validator';

/**
 * Path-param shape for any `:manholeNo` route. Source data ships numeric
 * strings ("1".."474"), so anchor to digits-only to reject bogus paths
 * before they hit Prisma.
 */
export class ManholeNoParam {
  @IsString()
  @Matches(/^[0-9]{1,5}$/, { message: 'manholeNo must be a numeric string' })
  manholeNo!: string;
}
