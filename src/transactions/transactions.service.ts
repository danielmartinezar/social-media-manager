import { Injectable, NotFoundException } from '@nestjs/common';
import { TransactionsRepository } from './transactions.repository';
import { Transaction } from './entity/transactions.entity';
import {
  CreateTransactionDto,
  UpdateTransactionDto,
} from './dtos/transactions.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly repo: TransactionsRepository,
    private readonly userService: UsersService,
  ) {}

  /**
   * Retrieve a single transaction by its unique identifier.
   * @param id - The primary key of the transaction to fetch.
   * @returns The Transaction entity if found.
   * @throws NotFoundException if the transaction does not exist.
   */
  async getTransactionById(id: number) {
    const transaction = await this.repo.findById(id);
    if (!transaction) {
      throw new NotFoundException(`Transaction ${id} not found`);
    }
    return {
      ...transaction,
      user: { ...transaction.user, password: undefined },
    };
  }

  /**
   * Retrieve a paginated list of transactions for a specific user.
   * @param userId   - Identifier of the user whose transactions to fetch.
   * @param page     - Page number (1-based).
   * @param pageSize - Number of items per page.
   * @returns An object containing the transactions list and pagination metadata.
   */
  async getAllByUser(userId: string, page = 1, pageSize = 10) {
    const { items, total } = await this.repo.findAllByUser(
      userId,
      page,
      pageSize,
    );
    return {
      data: items.map((item) => ({
        ...item,
        user: { ...item.user, password: undefined },
      })),
      meta: {
        totalItems: total,
        currentPage: page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  /**
   * Create a new transaction record in the database.
   * @param dto - Data Transfer Object containing properties for the new transaction.
   * @returns The created Transaction entity.
   */
  async createTransaction(dto: CreateTransactionDto) {
    const transaction = new Transaction();
    transaction.amount = dto.amount;
    transaction.description = dto.description;
    const user = await this.userService.findUserById(dto.userId);
    if (!user) throw new NotFoundException(`User ${dto.userId} not found`);
    transaction.user = user;
    const result = await this.repo.createTransaction(transaction);
    return { ...result, user: { ...user, password: undefined } };
  }

  /**
   * Update an existing transaction with new values.
   * @param id  - The id of the transaction to update.
   * @param dto - DTO containing fields to update.
   * @returns The updated Transaction entity.
   * @throws NotFoundException if no transaction with the given id exists.
   */
  async updateTransaction(
    id: number,
    dto: UpdateTransactionDto,
  ): Promise<Transaction> {
    const updated = await this.repo.updateTransaction(id, {
      ...dto,
      date: dto.date ? new Date(dto.date) : undefined,
    } as Partial<Transaction>);
    if (!updated) throw new NotFoundException(`Transaction ${id} not found`);
    return updated;
  }

  /**
   * Delete a transaction by its id.
   * @param id - The id of the transaction to remove.
   * @returns void
   * @throws NotFoundException if the transaction does not exist.
   */
  async deleteTransaction(id: number): Promise<void> {
    // Ensure the transaction exists before deletion
    await this.getTransactionById(id);
    await this.repo.deleteTransaction(id);
  }
}
