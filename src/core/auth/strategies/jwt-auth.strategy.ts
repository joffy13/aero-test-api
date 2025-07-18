import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { UserService } from 'src/core/user/user.service';
import { AuthService } from '../auth.service';
import { Request } from 'express';

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || '',
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: { userId: string }) {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (!token) throw new UnauthorizedException('No token provided');

    const exists = await this.authService.findAuthToken(payload.userId, token);
    if (!exists) throw new UnauthorizedException('Token invalidated');

    return { userId: payload.userId };
  }
}
