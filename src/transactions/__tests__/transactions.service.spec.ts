/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
// src/transactions/transactions.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from '../transactions.service';
import { TransactionsRepository } from '../transactions.repository';
import { UsersService } from '../../users/users.service';
import { Transaction } from '../entity/transactions.entity';
import {
  CreateTransactionDto,
  UpdateTransactionDto,
} from '../dtos/transactions.dto';
import { NotFoundException } from '@nestjs/common';

const createFakeUser = (id = 1) =>
  ({
    id,
    email: `user${id}@mail.com`,
    name: 'John',
    lastName: 'Doe',
    password: 'hashed',
  }) as any;

const createFakeTransaction = (id = 1, userId = 1): Transaction =>
  ({
    id,
    amount: 100,
    description: 'Lunch',
    date: new Date(),
    user: createFakeUser(userId),
  }) as Transaction;

// ---------- Mocks ----------
const mockRepo = {
  findById: jest.fn(),
  findAllByUser: jest.fn(),
  createTransaction: jest.fn(),
  updateTransaction: jest.fn(),
  deleteTransaction: jest.fn(),
};

const mockUsersService = {
  findUserById: jest.fn(),
};

// ---------- Tests ----------
describe('TransactionsService', () => {
  let service: TransactionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        { provide: TransactionsRepository, useValue: mockRepo },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTransactionById', () => {
    it('returns sanitized transaction', async () => {
      mockRepo.findById.mockResolvedValue(createFakeTransaction());
      const res: any = await service.getTransactionById(1);
      expect(res.user.password).toBeUndefined();
    });

    it('throws NotFound when missing', async () => {
      mockRepo.findById.mockResolvedValue(null);
      await expect(service.getTransactionById(99)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('getAllByUser', () => {
    it('paginates and sanitizes users', async () => {
      const items = [createFakeTransaction(1), createFakeTransaction(2)];
      mockRepo.findAllByUser.mockResolvedValue({ items, total: 2 });
      const { data, meta } = await service.getAllByUser('1', 1, 1);
      expect(data[0].user.password).toBeUndefined();
      expect(meta.totalPages).toBe(2);
    });
  });

  describe('createTransaction', () => {
    it('creates a transaction when user exists', async () => {
      const dto: CreateTransactionDto = {
        amount: 50,
        description: 'Coffee',
        userId: 1,
      } as any;
      mockUsersService.findUserById.mockResolvedValue(createFakeUser());
      mockRepo.createTransaction.mockResolvedValue(createFakeTransaction(10));
      const res: any = await service.createTransaction(dto);
      expect(mockRepo.createTransaction).toHaveBeenCalled();
      expect(res.user.password).toBeUndefined();
    });

    it('throws NotFound when user missing', async () => {
      mockUsersService.findUserById.mockResolvedValue(null);
      await expect(
        service.createTransaction({
          amount: 1,
          description: '',
          userId: 9,
        } as any),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('updateTransaction', () => {
    it('updates when exists', async () => {
      const updated = createFakeTransaction(1);
      mockRepo.updateTransaction.mockResolvedValue(updated);
      const res = await service.updateTransaction(1, {
        amount: 200,
      } as UpdateTransactionDto);
      expect(res.id).toBe(1);
    });

    it('throws NotFound when missing', async () => {
      mockRepo.updateTransaction.mockResolvedValue(null);
      await expect(
        service.updateTransaction(99, {} as any),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('deleteTransaction', () => {
    it('deletes after verifying existence', async () => {
      mockRepo.findById.mockResolvedValue(createFakeTransaction());
      await service.deleteTransaction(1);
      expect(mockRepo.deleteTransaction).toHaveBeenCalledWith(1);
    });
  });
});
