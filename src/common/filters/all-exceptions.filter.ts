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
import { ErrorLoggerService } from 'src/modules/infrastructure/error-logger/error-logger.service';
import { Types } from 'mongoose';
import { AddErrorLogDto } from 'src/modules/infrastructure/error-logger/dtos/add-error-log.dto';

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

    // ---------- ERROR MESSAGE ----------
    let errorMessage: any;
    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      errorMessage = typeof res === 'string' ? { message: res } : res;
    } else {
      errorMessage = { message: 'Internal server error' };
    }

    // ---------- USER ID ----------
    const userId =
      (request as any)?.user?.id &&
      Types.ObjectId.isValid((request as any).user.id)
        ? new Types.ObjectId((request as any).user.id)
        : null;

    // ---------- STACK TRACE ----------
    const stack =
      exception instanceof Error ? exception.stack : null;

    // ---------- CLIENT IP ----------
    const ip =
      (request.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      request.socket.remoteAddress;

    // ---------- LOG OBJECT ----------
    const errorLogPayload: any = {
      message: errorMessage.message,
      user_id: userId,
      url: request.originalUrl,
      browser: request.headers['user-agent'],
      stack,  
      method: request.method,
      host: request.hostname,
      ip,
      body: this.sanitizeBody(request.body),
    };

    // ---------- SAVE TO DB ----------
    try {
      await this.errorLoggerService.addErrorLog(errorLogPayload);
    } catch (err) {
      this.logger.error('Failed to save error log', err);
    }

    // ---------- RESPONSE ----------
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.originalUrl,
      error: errorMessage,
    });
  }

  /**
   * Remove sensitive fields before logging
   */
  private sanitizeBody(body: any) {
    if (!body || typeof body !== 'object') return body;

    const cloned = { ...body };
    const sensitiveKeys = ['password', 'confirmPassword', 'token'];

    sensitiveKeys.forEach((key) => {
      if (cloned[key]) cloned[key] = '***';
    });

    return cloned;
  }
}
