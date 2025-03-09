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

  public catch(exception: Error, host: ArgumentsHost) {
    const { messages, status } = this.getCodeAndMessages(exception);
    const type = host.getType();

    switch (host.getType()) {
      case 'http': {
        const res: Response = host.switchToHttp().getResponse();

        this.logger.error(exception);

        return res.status(status).send({ messages, status });
      }
      default:
        this.logger.error(new Error(`unknown type: ${type}`));
        break;
    }
  }

  private getCodeAndMessages(exception: Error) {
    const { message } = exception;
    const messages = [message];

    if (exception instanceof HttpException) {
      const response = exception.getResponse();

      if (typeof response === 'string' || !('message' in response)) {
        return { messages, status: exception.getStatus() };
      }

      // bad request validation exceptions have a message array
      return {
        messages: Array.isArray(response.message)
          ? response.message
          : [response.message],
        status: exception.getStatus(),
      };
    }

    return { messages, status: HttpStatus.INTERNAL_SERVER_ERROR };
  }
}
