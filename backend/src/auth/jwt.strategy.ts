import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { AccountStatus, Role } from '@prisma/client';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

export interface JwtPayload {
  sub: string;
  email: string;
  sessionVersion: number;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string | null;
  status: AccountStatus;
  roles: Role[];
  tierId: string | null;
  tier: { id: string; name: string; priority: number } | null;
  tierPriority: number | null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { roles: true, tier: true },
    });

    if (!user || user.status === AccountStatus.DISABLED) {
      throw new UnauthorizedException();
    }

    if (payload.sessionVersion !== user.sessionVersion) {
      throw new UnauthorizedException();
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      status: user.status,
      roles: user.roles.map((item) => item.role),
      tierId: user.tierId,
      tier: user.tier
        ? {
            id: user.tier.id,
            name: user.tier.name,
            priority: user.tier.priority,
          }
        : null,
      tierPriority: user.tier?.priority ?? null,
    };
  }
}
