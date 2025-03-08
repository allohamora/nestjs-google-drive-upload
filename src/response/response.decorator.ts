import { ApiResponse, ApiResponseNoStatusOptions } from '@nestjs/swagger';
import { ErrorDto } from './error.dto';
import { HttpStatus } from '@nestjs/common';

const createApiErrorResponse =
  (status: number) => (options: ApiResponseNoStatusOptions) =>
    ApiResponse({
      ...options,
      status,
      type: ErrorDto,
    });

export const ApiErrorBadRequestResponse = createApiErrorResponse(
  HttpStatus.BAD_REQUEST,
);
export const ApiErrorInternalServerErrorResponse = createApiErrorResponse(
  HttpStatus.INTERNAL_SERVER_ERROR,
);
export const ApiErrorUnprocessableEntityResponse = createApiErrorResponse(
  HttpStatus.UNPROCESSABLE_ENTITY,
);
