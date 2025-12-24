import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorLoggerService } from 'src/modules/infrastructure/error-logger/error-logger.service';

@Catch()
@Injectable()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);
  constructor(private readonly errorLoggerService: ErrorLoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    this.logger.error(exception);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let errorResponse: string | object;

    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      errorResponse = typeof res === 'string' ? { message: res } : res;
    } else {
      errorResponse = { message: 'Internal server error' };
    }
    this.errorLoggerService.addErrorLog({
        message: errorResponse,
        url: '',
        host: 'localhost',
        body: {},
        user_id: ''
    })

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error: errorResponse,
    });
  }
}
