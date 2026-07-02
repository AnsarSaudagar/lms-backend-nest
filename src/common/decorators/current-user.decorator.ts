import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface AuthUser {
  userId: string;
  role: string;
}

/**
 * Extracts the authenticated user (set by JwtStrategy.validate) from the request.
 * Usage: `@CurrentUser() user: AuthUser` or `@CurrentUser('userId') userId: string`
 */
export const CurrentUser = createParamDecorator(
  (data: keyof AuthUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: AuthUser | undefined = request.user;
    return data ? user?.[data] : user;
  },
);
