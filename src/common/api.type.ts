import { HttpStatus } from '@nestjs/common';

export enum Status {
  OK = 'OK',
  ERROR = 'ERROR',
}
export interface MetaData {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface ApiResponseOk {
  response: {
    statusCode: HttpStatus;
    body: {
      status: Status;
      data: unknown;
      message: string;
      meta?: MetaData;
    };
  };
}

export enum IApiErrorMessages {
  INTERNAL_SERVER_ERROR = 'An unexpected error occurred. Please try again later',
}
