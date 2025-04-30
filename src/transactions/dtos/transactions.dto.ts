// src/transactions/dto/transactions.dto.ts

import { IsNumber, IsString, IsOptional, IsPositive } from 'class-validator';

/**
 * DTO for creating a new transaction
 */
export class CreateTransactionDto {
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  date?: string; // ISO string, optional

  @IsString()
  userId: string;
}

/**
 * DTO for updating an existing transaction
 */
export class UpdateTransactionDto {
  @IsOptional()
  @IsNumber()
  @IsPositive()
  amount?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  date?: string; // ISO string, optional
}
