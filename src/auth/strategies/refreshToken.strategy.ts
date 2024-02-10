import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { JwtPayload, JwtPayloadWithRefreshToken } from '../types';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('REFRESH_TOKEN_SECRET'),
      passReqToCallback: true,
    });
  }
  validate(req: Request, payload: JwtPayload): JwtPayloadWithRefreshToken {
    const authorizationHeader = req.headers['authorization'];
    const refreshToken = authorizationHeader?.replace('Bearer', '').trim();
    const { userId, username } = payload;
    return { userId, username, refreshToken };
  }
}
