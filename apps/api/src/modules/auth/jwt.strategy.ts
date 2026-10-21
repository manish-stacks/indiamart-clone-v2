import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

export interface JwtPayload {
  sub: string;
  email: string;
  roles: string[];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req: any) => {
          let token = null;
          if (req && req.cookies) {
            token = req.cookies['accessToken'];
          }
          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET || 'development_jwt_access_secret_key_change_in_production_min32chars',
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
        businessMembers: {
          include: {
            business: {
              select: {
                id: true,
                name: true,
                slug: true,
                verificationStatus: true,
              },
            },
          },
        },
      },
    });

    if (!user || user.status === 'SUSPENDED') {
      throw new UnauthorizedException('User account is invalid or suspended');
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      roles: user.roles.map((r) => r.role.name),
      businessMemberships: user.businessMembers.map((bm) => ({
        businessId: bm.businessId,
        businessName: bm.business.name,
        businessSlug: bm.business.slug,
        role: bm.role,
        verificationStatus: bm.business.verificationStatus,
      })),
    };
  }
}

