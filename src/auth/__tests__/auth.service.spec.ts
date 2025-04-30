import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../services/auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/users.service';
import { BlacklistService } from '../services/blacklist-tokens.service';
import { CreateUserDto } from '../../users/dtos/create-user.dto';
import { LoginDto } from '../dtos/auth.dto';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

const mockJwtService = {
  sign: jest.fn().mockReturnValue('signed-token'),
  decode: jest
    .fn()
    .mockReturnValue({ jti: 'abc', exp: Math.floor(Date.now() / 1000) + 3600 }),
  verify: jest.fn().mockReturnValue({
    sub: 1,
    email: 'test@mail.com',
    exp: Math.floor(Date.now() / 1000) + 604800,
  }),
};

const mockUsersService = {
  findOneByEmail: jest.fn(),
  createUser: jest.fn(),
};

const mockBlacklistService = {
  blacklist: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: BlacklistService, useValue: mockBlacklistService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('register', () => {
    it('should create a new user and return api response', async () => {
      const dto = {
        email: 'new@mail.com',
        password: '123',
        name: 'A',
        lastName: 'B',
      } as CreateUserDto;
      mockUsersService.findOneByEmail.mockResolvedValue(null);
      mockUsersService.createUser.mockResolvedValue({ id: 1, ...dto });

      const res = await service.register(dto);
      expect(mockUsersService.createUser).toHaveBeenCalledWith(dto);
      expect(res.response.statusCode).toBe(201);
    });
  });

  describe('login', () => {
    it('should validate credentials and return tokens', async () => {
      const dto = { email: 'test@mail.com', password: '123456' } as LoginDto;
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockUsersService.findOneByEmail.mockResolvedValue({
        id: 1,
        email: dto.email,
        password: 'hashed',
        name: 'N',
        lastName: 'L',
      });

      const res = await service.login(dto);
      expect(res.response.statusCode).toBe(200);
      expect(res.response.body.data).toHaveProperty(
        'accessToken',
        'signed-token',
      );
    });
  });

  describe('logout', () => {
    it('should blacklist token and return message', async () => {
      const res = await service.logout('jwt-token');
      expect(mockBlacklistService.blacklist).toHaveBeenCalled();
      expect(res.response.statusCode).toBe(200);
    });
  });
});
