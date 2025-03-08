import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(Error)
export class ErrorFilter implements ExceptionFilter {
  private logger = new Logger(ErrorFilter.name);

  public catch(
    exception: Error,
    host: ArgumentsHost,
  ): void | Response<unknown> {
    const { messages, status } = this.getCodeAndMessages(exception);
    const type = host.getType();

    switch (host.getType()) {
      case 'http': {
        const res: Response = host.switchToHttp().getResponse();

        this.logger.error(exception);

        return res.status(status).send({ messages, status });
      }
      default:
        this.logger.error(`unknown type: ${type}`);
        break;
    }
  }

  private getCodeAndMessages(exception: Error): {
    messages: string[];
    status: number;
  } {
    const { message } = exception;
    const messages = [message];

    if (exception instanceof HttpException) {
      const response = exception.getResponse();

      if (typeof response === 'object') {
        const { message: resMessage } = response as {
          message: string[] | string;
        };
        const finalMessages = Array.isArray(resMessage)
          ? resMessage
          : [resMessage];

        return { messages: finalMessages, status: exception.getStatus() };
      }

      return { messages, status: exception.getStatus() };
    }

    return { messages, status: HttpStatus.INTERNAL_SERVER_ERROR };
  }
}
