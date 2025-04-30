import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Transaction } from './entity/transactions.entity';

@Injectable()
export class TransactionsRepository extends Repository<Transaction> {
  constructor(private readonly dataSource: DataSource) {
    super(Transaction, dataSource.createEntityManager());
  }

  async findById(id: number): Promise<Transaction | null> {
    return this.findOne({ where: { id }, relations: ['user'] });
  }

  async findAllByUser(
    userId: string,
    page = 1,
    pageSize = 10,
  ): Promise<{ items: Transaction[]; total: number }> {
    const skip = (page - 1) * pageSize;
    console.log(userId);
    const [items, total] = await this.findAndCount({
      where: { user: { id: userId } },
      relations: ['user'],
      skip,
      take: pageSize,
    });
    return { items, total };
  }

  async createTransaction(transaction: Transaction): Promise<Transaction> {
    return this.save(transaction);
  }

  async updateTransaction(
    id: number,
    updateData: Partial<Transaction>,
  ): Promise<Transaction | null> {
    await this.update(id, updateData);
    return this.findById(id);
  }

  async deleteTransaction(id: number): Promise<void> {
    await this.delete(id);
  }
}
