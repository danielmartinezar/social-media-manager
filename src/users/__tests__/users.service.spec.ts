/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/users/users.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { UserRepository } from '../users.repository';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../dtos/create-user.dto';

jest.mock('bcrypt');

// ----------------- Mock repo -----------------
const mockRepo = {
  findByEmail: jest.fn(),
  findOneBy: jest.fn(),
  createUser: jest.fn(),
};

// ----------------- Helpers -----------------
const fakeUser = (overrides?: Partial<any>) => ({
  id: 1,
  email: 'test@mail.com',
  name: 'John',
  lastName: 'Doe',
  password: 'hashed',
  ...overrides,
});

// ----------------- Tests -----------------
describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UserRepository, useValue: mockRepo },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOneByEmail', () => {
    it('returns user when found', async () => {
      mockRepo.findByEmail.mockResolvedValue(fakeUser());
      const user = await service.findOneByEmail('test@mail.com');
      expect(mockRepo.findByEmail).toHaveBeenCalledWith('test@mail.com');
      expect(user!.email).toBe('test@mail.com');
    });
  });

  describe('findUserById', () => {
    it('returns user by id', async () => {
      mockRepo.findOneBy.mockResolvedValue(fakeUser());
      const user = await service.findUserById('1');
      expect(mockRepo.findOneBy).toHaveBeenCalledWith({ id: '1' });
      expect(user!.id).toBe(1);
    });
  });

  describe('createUser', () => {
    it('hashes password and saves user', async () => {
      const dto: CreateUserDto = {
        email: 'new@mail.com',
        password: 'plain',
        name: 'N',
        lastName: 'L',
      } as any;
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPW');
      mockRepo.createUser.mockImplementation((user) => Promise.resolve(user));

      const created = await service.createUser(dto);

      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith('plain', 'salt');
      expect(mockRepo.createUser).toHaveBeenCalled();
      expect(created.password).toBe('hashedPW');
    });
  });
});
