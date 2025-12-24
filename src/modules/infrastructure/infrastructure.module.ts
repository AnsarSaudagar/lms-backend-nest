import { Module } from '@nestjs/common';
import { ErrorLoggerModule } from './error-logger/error-logger.module';

@Module({
  imports: [ErrorLoggerModule],
  exports: [ErrorLoggerModule]
})
export class InfrastructureModule {}
