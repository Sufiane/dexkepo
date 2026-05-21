import { Injectable, NotFoundException } from '@nestjs/common';
import { UserPublic } from '@dexkepo/shared';
import { PokemonNameTranslator } from '../pokemon/pokemon-name-translator';
import { UserRow, UsersDb, UserProfilePatch } from './users.db';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    private db: UsersDb,
    private translator: PokemonNameTranslator,
  ) {}

  async me(id: string): Promise<UserPublic> {
    const row = await this.db.findById(id);

    if (!row) {
      throw new NotFoundException('user not found');
    }

    return toPublic(row);
  }

  async updateProfile(id: string, patch: UpdateProfileDto): Promise<UserPublic> {
    // chosenFavorite is canonical EN in the DB. The FE may send the JA form
    // (whatever the picker showed), so normalise here before writing.
    const normalised = await this.normaliseFavorite(patch);
    const row = await this.db.updateProfile(id, normalised);

    if (!row) {
      throw new NotFoundException('user not found');
    }

    return toPublic(row);
  }

  private async normaliseFavorite(patch: UpdateProfileDto): Promise<UserProfilePatch> {
    if (patch.chosenFavorite == null) {
      return patch;
    }

    const canonical = await this.translator.toCanonical(patch.chosenFavorite);

    return { ...patch, chosenFavorite: canonical };
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
