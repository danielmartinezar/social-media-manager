// src/transactions/dtos/transactions.dto.ts
import { IsNumber, IsString, IsOptional, IsPositive } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTransactionDto {
  @ApiProperty({ example: 50 })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ example: 'Lunch at cafe' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ example: '2025-04-30T12:00:00Z' })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiProperty({ example: 'user-uuid-here' })
  @IsString()
  userId: string;
}

export class UpdateTransactionDto {
  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  amount?: number;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '2025-04-30T18:00:00Z' })
  @IsOptional()
  @IsString()
  date?: string;
}
