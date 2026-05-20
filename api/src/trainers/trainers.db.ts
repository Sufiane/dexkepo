import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type TrainerRow = {
  id: string;
  pseudo: string;
  createdAt: Date;
  publicProfile: boolean;
};

@Injectable()
export class TrainersDb {
  constructor(private prisma: PrismaService) {}

  findByPseudo(pseudo: string): Promise<TrainerRow | null> {
    return this.prisma.user.findUnique({
      where: { pseudo },
      select: {
        id: true,
        pseudo: true,
        createdAt: true,
        publicProfile: true,
      },
    });
  }
}
