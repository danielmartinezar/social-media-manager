import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { BlacklistService } from './services/blacklist-tokens.service';
import { ExtractJwt } from 'passport-jwt';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly jwtService: JwtService,
    private readonly blacklistService: BlacklistService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);

    const req = context.switchToHttp().getRequest<Request>();
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    let payload: { jti: string };
    try {
      payload = this.jwtService.verify(token);
    } catch (err) {
      console.log(err);
      throw new UnauthorizedException('Invalid or expired token');
    }

    if (await this.blacklistService.isBlacklisted(payload.jti)) {
      throw new UnauthorizedException('Token has been revoked');
    }

    return true;
  }

  handleRequest(err, user) {
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid or expired token');
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return user;
  }
}
