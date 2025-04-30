import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
  HttpStatus,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { LoginDto } from '../dtos/auth.dto';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/users.service';
import { CreateUserDto } from 'src/users/dtos/create-user.dto';
import { randomUUID } from 'node:crypto';
import { JwtPayload } from '../auth.types';
import { BlacklistService } from './blacklist-tokens.service';
import { createApiResponse } from '../../common/utils/response.utils';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
    private readonly blacklistService: BlacklistService,
  ) {}

  /**
   * Register a new user and return standardized response
   */
  async register(registerUserDto: CreateUserDto) {
    const existing = await this.userService.findOneByEmail(
      registerUserDto.email,
    );

    if (existing) {
      throw new BadRequestException('Email already in use');
    }

    await this.userService.createUser(registerUserDto);
    return createApiResponse({
      statusCode: HttpStatus.CREATED,
      message: 'User registered successfully',
    });
  }

  /**
   * Authenticate user and issue tokens
   */
  async login(loginDto: LoginDto) {
    const user = await this.userService.findOneByEmail(loginDto.email);
    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      jti: randomUUID(),
    };
    const accessToken = this.generateToken('1h', payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return createApiResponse({
      statusCode: HttpStatus.OK,
      message: 'User logged in successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          lastName: user.lastName,
        },
        accessToken,
        refreshToken,
      },
    });
  }

  /**
   * Logout user by blacklisting the token
   */
  async logout(token: string) {
    if (!token) {
      throw new UnauthorizedException('Token required for logout');
    }
    const decoded = this.jwtService.decode<{
      exp: number;
      jti: string;
      sub: number;
      email: string;
    }>(token);
    const { jti, exp } = decoded;
    const ttlSeconds = exp - Math.floor(Date.now() / 1000);
    if (ttlSeconds > 0) {
      await this.blacklistService.blacklist(jti, ttlSeconds);
    }
    return createApiResponse({
      statusCode: HttpStatus.OK,
      message: 'User logged out successfully',
    });
  }

  /**
   * Refresh access token given a valid refresh token
   */
  refreshToken(oldRefresh: string) {
    if (!oldRefresh) {
      throw new UnauthorizedException('Refresh token not provided');
    }

    let payload: JwtPayload & { exp: number };
    try {
      payload = this.jwtService.verify<JwtPayload & { exp: number }>(
        oldRefresh,
      );
    } catch {
      throw new ForbiddenException('Invalid or expired refresh token');
    }

    const newPayload: JwtPayload = {
      sub: payload.sub,
      email: payload.email,
      jti: randomUUID(),
    };
    const accessToken = this.generateToken('1h', newPayload);
    const refreshToken = this.generateToken('7d', newPayload);

    return createApiResponse({
      statusCode: HttpStatus.OK,
      message: 'Token refreshed successfully',
      data: {
        user: { id: payload.sub, email: payload.email },
        accessToken,
        refreshToken,
      },
    });
  }

  /** Helper to sign a JWT with a given TTL */
  private generateToken(expiresIn: string, payload: JwtPayload) {
    return this.jwtService.sign(payload, { expiresIn });
  }
}
