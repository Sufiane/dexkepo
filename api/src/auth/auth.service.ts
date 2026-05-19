import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthDb, PublicUser } from './auth.db';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

export type AuthResponse = {
  accessToken: string;
  user: PublicUser;
};

@Injectable()
export class AuthService {
  constructor(private db: AuthDb, private jwt: JwtService) {}

  private sign(userId: string): string {
    return this.jwt.sign({ sub: userId });
  }

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existing = await this.db.findByEmailOrPseudo(dto.email, dto.pseudo);

    if (existing) {
      throw new ConflictException('Email or pseudo already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.db.createUser({
      pseudo: dto.pseudo,
      email: dto.email,
      passwordHash,
    });

    return { accessToken: this.sign(user.id), user };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.db.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const ok = await bcrypt.compare(dto.password, user.password);

    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      accessToken: this.sign(user.id),
      user: { id: user.id, pseudo: user.pseudo, email: user.email, createdAt: user.createdAt },
    };
  }
}
