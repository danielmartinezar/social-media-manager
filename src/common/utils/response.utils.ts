import { HttpStatus } from '@nestjs/common';
import { MetaData, Status } from '../api.type';

interface ApiResponseOptions<T> {
  error?: {
    code: string;
    details: string;
  };
  data?: T;
  message?: string;
  statusCode?: number;
  meta?: MetaData;
}

export function createApiResponse<T>(options: ApiResponseOptions<T>) {
  return {
    response: {
      statusCode: options.statusCode || HttpStatus.OK,
      body: {
        status: Status.OK,
        message: options.message || '',
        data: options.data || null,
        meta: options.meta || null,
        error: options.error || null,
      },
    },
  };
}
