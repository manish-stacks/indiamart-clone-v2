import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '@marketplace/shared';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, ...(dto.phone ? [{ phone: dto.phone }] : [])],
      },
    });

    if (existing) {
      throw new ConflictException('User with this email or phone number already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    // Find or create role
    const roleName = dto.initialRole || UserRole.BUYER;
    let role = await this.prisma.role.findUnique({
      where: { name: roleName },
    });

    if (!role) {
      role = await this.prisma.role.create({
        data: {
          name: roleName,
          description: `Default role for ${roleName}`,
        },
      });
    }

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        phone: dto.phone,
        passwordHash,
        fullName: dto.fullName,
        roles: {
          create: {
            roleId: role.id,
          },
        },
      },
      include: {
        roles: {
          include: { role: true },
        },
      },
    });

    return this.generateTokens(user.id, user.email, [role.name]);
  }

  async login(dto: LoginDto, userAgent?: string, ipAddress?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        roles: {
          include: { role: true },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password credentials');
    }

    if (user.status === 'SUSPENDED') {
      throw new UnauthorizedException('This account has been suspended. Please contact support.');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password credentials');
    }

    const roles = user.roles.map((r) => r.role.name);
    return this.generateTokens(user.id, user.email, roles, userAgent, ipAddress);
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'development_jwt_refresh_secret_key_change_in_production_min32chars',
      });

      const session = await this.prisma.session.findFirst({
        where: {
          userId: payload.sub,
          expiresAt: { gt: new Date() },
        },
      });

      if (!session) {
        throw new UnauthorizedException('Refresh token is expired or revoked');
      }

      // Rotate session token
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: {
          roles: { include: { role: true } },
        },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const roles = user.roles.map((r) => r.role.name);
      // Invalidate existing session
      await this.prisma.session.delete({ where: { id: session.id } });

      return this.generateTokens(user.id, user.email, roles);
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userId: string) {
    await this.prisma.session.deleteMany({
      where: { userId },
    });
    return { loggedOut: true };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: { include: { role: true } },
        businessMembers: {
          include: {
            business: {
              select: {
                id: true,
                name: true,
                slug: true,
                businessType: true,
                verificationStatus: true,
                gstinVerified: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      status: user.status,
      roles: user.roles.map((r) => r.role.name),
      businessMemberships: user.businessMembers.map((bm) => ({
        businessId: bm.businessId,
        businessName: bm.business.name,
        businessSlug: bm.business.slug,
        businessType: bm.business.businessType,
        role: bm.role,
        verificationStatus: bm.business.verificationStatus,
        gstinVerified: bm.business.gstinVerified,
      })),
      createdAt: user.createdAt,
    };
  }

  private async generateTokens(
    userId: string,
    email: string,
    roles: string[],
    userAgent?: string,
    ipAddress?: string,
  ) {
    const payload = { sub: userId, email, roles };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET || 'development_jwt_access_secret_key_change_in_production_min32chars',
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    });

    const refreshToken = this.jwtService.sign(
      { sub: userId },
      {
        secret: process.env.JWT_REFRESH_SECRET || 'development_jwt_refresh_secret_key_change_in_production_min32chars',
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      },
    );

    // Save session in DB
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.session.create({
      data: {
        userId,
        refreshToken,
        userAgent,
        ipAddress,
        expiresAt,
      },
    });

    return {
      user: {
        id: userId,
        email,
        roles,
      },
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 mins
    };
  }
}

