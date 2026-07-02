import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorLoggerService } from 'src/infrastructure/error-logger/error-logger.service';
import { Types } from 'mongoose';
import { buildRequestPayload, extractBrowserShort, extractErrorType, sanitizeBody } from '../utils/error-handler.util';

@Catch()
@Injectable()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(
    private readonly errorLoggerService: ErrorLoggerService,
  ) {}

  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let errorMessage: any;
    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      errorMessage = typeof res === 'string' ? { message: res } : res;
    } else {
      errorMessage = { message: 'Internal server error' };
    }

    const userId =
      (request as any)?.user?.id &&
        Types.ObjectId.isValid((request as any).user.id)
        ? new Types.ObjectId((request as any).user.id)
        : null;

    const stack =
      exception instanceof Error ? exception.stack : null;

    const ip =
      (request.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      request.socket.remoteAddress;

    const errorLogPayload: any = {
      message: errorMessage.message,
      user_id: userId,
      url: request.originalUrl,
      browser: extractBrowserShort(request.headers['user-agent']),
      stack,
      method: request.method,
      host: request.hostname,
      ip,
      body: sanitizeBody(request.body),
      payload: buildRequestPayload(request),
      type: extractErrorType(exception)
    };
    this.logger.error(
      `${request.method} ${request.originalUrl} ${status} - ${errorMessage.error ?? 'Error'}: ${errorMessage.message}`,
    );

    try {
      await this.errorLoggerService.addErrorLog(errorLogPayload);
    } catch (err) {
      this.logger.error('Failed to save error log', err);
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.originalUrl,
      error: errorMessage,
    });
  }
 
}
