import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { UserPublic } from '@dexkepo/shared';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { AuthUser, CurrentUser } from '../common/current-user.decorator';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private svc: UsersService) {}

  @Get('me')
  me(@CurrentUser() user: AuthUser): Promise<UserPublic> {
    return this.svc.me(user.id);
  }

  @Patch('me')
  update(
    @CurrentUser() user: AuthUser,
    @Body() body: UpdateProfileDto,
  ): Promise<UserPublic> {
    return this.svc.updateProfile(user.id, body);
  }
}
