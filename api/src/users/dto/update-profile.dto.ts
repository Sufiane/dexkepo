import { IsBoolean, IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsBoolean()
  publicProfile?: boolean;

  /**
   * Pokémon name pinned as the user's favorite. `null` clears the choice.
   * `ValidateIf` lets us accept literal `null` without `@IsString` rejecting it.
   */
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(50)
  chosenFavorite?: string | null;
}
