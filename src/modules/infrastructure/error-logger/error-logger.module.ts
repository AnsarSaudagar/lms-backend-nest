import { Module } from '@nestjs/common';
import { ErrorLoggerService } from './error-logger.service';
import { ErrorLoggerController } from './error-logger.controller';

@Module({
  controllers: [ErrorLoggerController],
  providers: [ErrorLoggerService],
})
export class ErrorLoggerModule {}
