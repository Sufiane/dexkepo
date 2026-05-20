import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsBoolean()
  publicProfile?: boolean;
}
