import { IsString, Length, Matches } from 'class-validator';

/**
 * Path-param shape for `/trainers/:pseudo`. Mirrors the rules the register
 * endpoint already applies (3–32 chars, alphanumeric + underscore/hyphen)
 * so callers can't probe arbitrary strings against the DB.
 */
export class TrainerPseudoParam {
  @IsString()
  @Length(3, 32)
  @Matches(/^[A-Za-z0-9_-]+$/, {
    message: 'pseudo must be alphanumeric (underscore/hyphen allowed)',
  })
  pseudo!: string;
}
