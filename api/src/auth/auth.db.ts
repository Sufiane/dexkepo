import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Data access for users + auth. The only file in this module that imports
 * Prisma. Business logic (hashing, token signing, conflict detection) lives
 * in auth.service.ts; JwtStrategy uses findById for token validation.
 */
@Injectable()
export class AuthDb {
  constructor(private prisma: PrismaService) {}

  findByEmailOrPseudo(email: string, pseudo: string) {
    return this.prisma.user.findFirst({
      where: { OR: [{ email }, { pseudo }] },
    });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  createUser(input: { pseudo: string; email: string; passwordHash: string }) {
    return this.prisma.user.create({
      data: {
        pseudo: input.pseudo,
        email: input.email,
        password: input.passwordHash,
      },
      select: { id: true, pseudo: true, email: true, createdAt: true },
    });
  }
}
