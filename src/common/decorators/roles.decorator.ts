import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Restricts a route/controller to the given roles (keys of USER_TYPE).
 * Must be used together with JwtAuthGuard + RolesGuard.
 * Usage: `@Roles(ADMIN_KEY)`
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
