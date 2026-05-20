import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type UserRow = Pick<
  User,
  'id' | 'pseudo' | 'email' | 'publicProfile' | 'createdAt'
>;

const PUBLIC_SELECT = {
  id: true,
  pseudo: true,
  email: true,
  publicProfile: true,
  createdAt: true,
} as const;

@Injectable()
export class UsersDb {
  constructor(private prisma: PrismaService) {}

  findById(id: string): Promise<UserRow | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: PUBLIC_SELECT,
    });
  }

  updateProfile(
    id: string,
    patch: { publicProfile?: boolean },
  ): Promise<UserRow | null> {
    return this.prisma.user.update({
      where: { id },
      data: patch,
      select: PUBLIC_SELECT,
    });
  }
}
