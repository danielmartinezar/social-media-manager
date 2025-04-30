/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/transactions/transactions.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsController } from '../transactions.controller';
import { TransactionsService } from '../transactions.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { ExecutionContext, BadRequestException } from '@nestjs/common';
import { Transaction } from '../entity/transactions.entity';
import { MetaData } from '../../common/api.type';

// -------------------- mocks --------------------
const mockTransactionsService = {
  getTransactionById: jest.fn(),
  getAllByUser: jest.fn(),
  createTransaction: jest.fn(),
  updateTransaction: jest.fn(),
  deleteTransaction: jest.fn(),
};

// Dummy guard that always allows the request to pass
class MockJwtAuthGuard {
  canActivate(_context: ExecutionContext): boolean {
    return true;
  }
}

function createFakeTransaction(id = 1): Transaction {
  return {
    id,
    amount: 100,
    description: 'Lunch',
    date: new Date(),
    user: { id: 9 } as any,
    transactions: undefined as any, // relation placeholder
  } as Transaction;
}

const paginationMeta: MetaData = {
  totalItems: 3,
  pageSize: 2,
  totalPages: 2,
  currentPage: 1,
};

// -------------------- tests --------------------
describe('TransactionsController', () => {
  let controller: TransactionsController;

  beforeEach(async () => {
    mockTransactionsService.getTransactionById.mockResolvedValue(
      createFakeTransaction(),
    );
    mockTransactionsService.getAllByUser.mockResolvedValue({
      data: [createFakeTransaction(1), createFakeTransaction(2)],
      meta: paginationMeta,
    });
    mockTransactionsService.createTransaction.mockResolvedValue(
      createFakeTransaction(10),
    );
    mockTransactionsService.updateTransaction.mockResolvedValue(
      createFakeTransaction(20),
    );
    mockTransactionsService.deleteTransaction.mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        { provide: TransactionsService, useValue: mockTransactionsService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(MockJwtAuthGuard)
      .compile();

    controller = module.get(TransactionsController);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getById', () => {
    it('returns api response with transaction data', async () => {
      const res: any = await controller.getById(1);
      expect(mockTransactionsService.getTransactionById).toHaveBeenCalledWith(
        1,
      );
      expect(res.response.body.data.id).toBe(1);
    });
  });

  describe('getAllByUser', () => {
    it('throws BadRequest when userId missing', async () => {
      await expect(
        controller.getAllByUser(undefined as any, 1, 10),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('returns paginated list', async () => {
      const res: any = await controller.getAllByUser('9', 1 as any, 2 as any);
      expect(mockTransactionsService.getAllByUser).toHaveBeenCalledWith(
        '9',
        1,
        2,
      );
      expect(res.response.body.meta).toEqual(paginationMeta);
    });
  });

  describe('create', () => {
    it('creates a transaction and wraps response', async () => {
      const dto = { amount: 50, description: 'Snack', userId: 9 } as any;
      const res: any = await controller.create(dto);
      expect(mockTransactionsService.createTransaction).toHaveBeenCalledWith(
        dto,
      );
      expect(res.response.statusCode).toBe(201);
    });
  });

  describe('update', () => {
    it('updates a transaction and returns wrapped response', async () => {
      const dto = { amount: 70 } as any;
      const res: any = await controller.update(20, dto);
      expect(mockTransactionsService.updateTransaction).toHaveBeenCalledWith(
        20,
        dto,
      );
      expect(res.response.body.data.id).toBe(20);
    });
  });

  describe('delete', () => {
    it('deletes a transaction and returns 204 response', async () => {
      const res: any = await controller.delete(30);
      expect(mockTransactionsService.deleteTransaction).toHaveBeenCalledWith(
        30,
      );
      expect(res.response.statusCode).toBe(204);
    });
  });
});
