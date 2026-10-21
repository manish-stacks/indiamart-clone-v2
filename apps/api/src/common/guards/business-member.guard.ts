import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { BusinessMemberRole, UserRole } from '@marketplace/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { BUSINESS_ROLES_KEY } from '../decorators/business-roles.decorator';

@Injectable()
export class BusinessMemberGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<BusinessMemberRole[]>(
      BUSINESS_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User is not authenticated');
    }

    // System Admins bypass business check
    if (user.roles?.includes(UserRole.SUPER_ADMIN) || user.roles?.includes(UserRole.ADMIN)) {
      return true;
    }

    const businessId = request.params.businessId || request.params.id || request.body.businessId;
    if (!businessId) {
      return true; // No specific business scoped parameter
    }

    const membership = await this.prisma.businessMember.findUnique({
      where: {
        businessId_userId: {
          businessId,
          userId: user.id,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('You are not an authorized member of this business');
    }

    // If specific business roles are required, check role hierarchy
    if (requiredRoles && requiredRoles.length > 0) {
      if (!requiredRoles.includes(membership.role as BusinessMemberRole)) {
        throw new ForbiddenException(
          `Action requires business role: ${requiredRoles.join(' or ')}`,
        );
      }
    }

    request.businessMembership = membership;
    return true;
  }
}

