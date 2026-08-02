import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AccountStatus, Role, User } from '@prisma/client';
import { UsersService } from '../users/users.service';
import { PasswordService } from './password.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { AuthenticatedUser } from './jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();

    const existingUser = await this.usersService.findByEmail(email);

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await this.passwordService.hash(dto.password);

    return this.usersService.create({
      email,
      name: dto.name,
      passwordHash,
    });
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.email, dto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, roles: user.roles };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user,
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user || user.status !== AccountStatus.ACTIVE) {
      return null;
    }

    const passwordValid = await this.passwordService.compare(
      password,
      user.passwordHash,
    );

    if (!passwordValid) {
      return null;
    }

    return this.toSafeUser(user);
  }

  /**
   * Builds the safe current-session payload for /auth/me.
   * It reflects the database-backed request user resolved by the JWT strategy.
   */
  buildSession(
    user: AuthenticatedUser,
    effectiveAccess?: {
      tier: { id: string; name: string; priority: number } | null;
      tierPriority: number | null;
      status: string;
      startsAt: string | null;
      expiresAt: string | null;
      permanent: boolean;
      expiringSoon: boolean;
    },
  ) {
    const roles = user.roles;
    const isSuperAdmin = roles.includes(Role.SUPER_ADMIN);
    const isArtist = roles.includes(Role.ARTIST);
    const isSubscriber = roles.includes(Role.SUBSCRIBER);

    // Effective access reflects the current valid assignment, not stale tier
    // data from the JWT or compatibility fields. Only granting states expose a
    // usable tier to the client.
    const grantingStates = ['ACTIVE', 'EXPIRING_SOON', 'PERMANENT'];
    const isGranting = effectiveAccess
      ? grantingStates.includes(effectiveAccess.status)
      : false;

    const effectiveTier =
      effectiveAccess && isGranting ? effectiveAccess.tier : null;
    const effectiveTierId = effectiveTier?.id ?? null;
    const effectiveTierPriority = effectiveTier?.priority ?? null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      status: user.status,
      roles,
      tier: effectiveTier,
      tierId: effectiveTierId,
      tierPriority: effectiveTierPriority,
      tierAccessStatus: effectiveAccess?.status ?? 'NONE',
      tierStartsAt: effectiveAccess?.startsAt ?? null,
      tierExpiresAt: effectiveAccess?.expiresAt ?? null,
      tierPermanent: effectiveAccess?.permanent ?? false,
      tierExpiringSoon: effectiveAccess?.expiringSoon ?? false,
      isSuperAdmin,
      isArtist,
      isSubscriber,
    };
  }

  private toSafeUser(
    user: User & {
      roles: { role: Role }[];
      tier: { id: string; name: string; priority: number } | null;
    },
  ) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      status: user.status,
      roles: user.roles.map((item) => item.role),
      tier: user.tier,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
