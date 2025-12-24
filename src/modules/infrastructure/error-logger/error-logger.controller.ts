import { Controller } from '@nestjs/common';
import { ErrorLoggerService } from './error-logger.service';

@Controller('error-logger')
export class ErrorLoggerController {
  constructor(private readonly errorLoggerService: ErrorLoggerService) {}
}
