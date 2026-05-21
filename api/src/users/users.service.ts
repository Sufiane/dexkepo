import { Injectable, NotFoundException } from '@nestjs/common';
import { UserPublic } from '@dexkepo/shared';
import { PokemonDb } from '../pokemon/pokemon.db';
import { UserRow, UsersDb, UserProfilePatch } from './users.db';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    private db: UsersDb,
    private pokemonDb: PokemonDb,
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

    const incoming = patch.chosenFavorite;
    const all = await this.pokemonDb.findAll();

    // Direct EN match wins (no work to do).
    if (all.some((entry) => entry.name === incoming)) {
      return patch;
    }

    // JA → EN reverse lookup.
    const enMatch = all.find((entry) => entry.nameJa === incoming);

    if (enMatch) {
      return { ...patch, chosenFavorite: enMatch.name };
    }

    // Unknown name — let it through. Either a typo (user will see no display
    // sprite) or a name added to the catalogue after this enrichment ran.
    return patch;
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
