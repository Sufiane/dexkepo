import { Injectable, NotFoundException } from '@nestjs/common';
import { UserPublic } from '@dexkepo/shared';
import { UserRow, UsersDb } from './users.db';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private db: UsersDb) {}

  async me(id: string): Promise<UserPublic> {
    const row = await this.db.findById(id);

    if (!row) {
      throw new NotFoundException('user not found');
    }

    return toPublic(row);
  }

  async updateProfile(id: string, patch: UpdateProfileDto): Promise<UserPublic> {
    const row = await this.db.updateProfile(id, patch);

    if (!row) {
      throw new NotFoundException('user not found');
    }

    return toPublic(row);
  }
}

function toPublic(row: UserRow): UserPublic {
  return {
    id: row.id,
    pseudo: row.pseudo,
    email: row.email,
    publicProfile: row.publicProfile,
    chosenFavorite: row.chosenFavorite,
    createdAt: row.createdAt.toISOString(),
  };
}
