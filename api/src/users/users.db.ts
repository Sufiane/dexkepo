import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type UserRow = Pick<
  User,
  'id' | 'pseudo' | 'email' | 'publicProfile' | 'chosenFavorite' | 'createdAt'
>;

const PUBLIC_SELECT = {
  id: true,
  pseudo: true,
  email: true,
  publicProfile: true,
  chosenFavorite: true,
  createdAt: true,
} as const;

export type UserProfilePatch = {
  publicProfile?: boolean;
  chosenFavorite?: string | null;
};

@Injectable()
export class UsersDb {
  constructor(private prisma: PrismaService) {}

  findById(id: string): Promise<UserRow | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: PUBLIC_SELECT,
    });
  }

  updateProfile(id: string, patch: UserProfilePatch): Promise<UserRow | null> {
    return this.prisma.user.update({
      where: { id },
      data: patch,
      select: PUBLIC_SELECT,
    });
  }
}
