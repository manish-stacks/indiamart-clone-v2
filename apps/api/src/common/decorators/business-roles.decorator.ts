import { SetMetadata } from '@nestjs/common';
import { BusinessMemberRole } from '@marketplace/shared';

export const BUSINESS_ROLES_KEY = 'business_roles';
export const BusinessRoles = (...roles: BusinessMemberRole[]) => SetMetadata(BUSINESS_ROLES_KEY, roles);

