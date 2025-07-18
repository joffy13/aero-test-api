import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const JwtToken = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | null => {
    const request = ctx.switchToHttp().getRequest();
    const authHeader = request?.headers['authorization'] || '';
    const [type, token] = authHeader.split(' ');
    if (type === 'Bearer' && token) {
      return token;
    }
    return null;
  },
);
