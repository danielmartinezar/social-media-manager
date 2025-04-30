import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dtos/transactions.dto';
import { UpdateTransactionDto } from './dtos/transactions.dto';
import { Transaction } from './entity/transactions.entity';
import { createApiResponse } from '../common/utils/response.utils';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number) {
    const transaction = await this.transactionsService.getTransactionById(id);
    return createApiResponse({
      statusCode: HttpStatus.OK,
      message: 'Transaction fetched successfully',
      data: transaction,
    });
  }

  @Get()
  async getAllByUser(
    @Query('userId') userId: string,
    @Query('page') page: number = 1,
    @Query('size') size: number = 10,
  ) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    const transactionsByUser = await this.transactionsService.getAllByUser(
      userId,
      page,
      size,
    );
    return createApiResponse({
      statusCode: HttpStatus.OK,
      message: 'Transactions fetched successfully',
      data: transactionsByUser.data,
      meta: transactionsByUser.meta,
    });
  }

  @Post()
  async create(@Body() dto: CreateTransactionDto) {
    const created = await this.transactionsService.createTransaction(dto);
    return createApiResponse({
      statusCode: HttpStatus.CREATED,
      message: 'Transaction created successfully',
      data: created,
    });
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTransactionDto,
  ) {
    const updated: Transaction =
      await this.transactionsService.updateTransaction(id, dto);
    return createApiResponse({
      statusCode: HttpStatus.OK,
      message: 'Transaction updated successfully',
      data: updated,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.transactionsService.deleteTransaction(id);
    return createApiResponse({
      statusCode: HttpStatus.NO_CONTENT,
      message: 'Transaction deleted successfully',
    });
  }
}
