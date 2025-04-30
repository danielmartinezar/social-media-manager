/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../services/auth.service';
import { JwtAuthGuard } from '../jwt-auth.guard';
import { ExecutionContext } from '@nestjs/common';

const mockAuthService = {
  register: jest
    .fn()
    .mockResolvedValue({ message: 'User registered successfully' }),
  login: jest.fn().mockResolvedValue({
    user: { id: 1, email: 'test@mail.com' },
    accessToken: 'access',
    refreshToken: 'refresh',
  }),
  logout: jest
    .fn()
    .mockResolvedValue({ message: 'User logged out successfully' }),
  refreshToken: jest.fn().mockResolvedValue({
    user: { id: 1, email: 'test@mail.com' },
    accessToken: 'newAccess',
    refreshToken: 'newRefresh',
  }),
};

// Dummy guard that always allows
class MockJwtAuthGuard {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canActivate(_context: ExecutionContext): boolean {
    return true;
  }
}

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(MockJwtAuthGuard)
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call AuthService.register and return its response', async () => {
      const dto = {
        email: 'test@mail.com',
        password: '123456',
        name: 'John',
        lastName: 'Doe',
      } as any;
      const result = await controller.register(dto);
      expect(mockAuthService.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ message: 'User registered successfully' });
    });
  });

  describe('login', () => {
    it('should call AuthService.login and return tokens', async () => {
      const dto = { email: 'test@mail.com', password: '123456' } as any;
      const result = await controller.login(dto);
      expect(mockAuthService.login).toHaveBeenCalledWith(dto);
      expect(result).toHaveProperty('accessToken', 'access');
    });
  });

  describe('logout', () => {
    it('should call AuthService.logout with extracted token', async () => {
      const req: any = { headers: { authorization: 'Bearer fakeToken' } };
      const result = await controller.logout(req);
      expect(mockAuthService.logout).toHaveBeenCalledWith('fakeToken');
      expect(result).toEqual({ message: 'User logged out successfully' });
    });
  });
});
