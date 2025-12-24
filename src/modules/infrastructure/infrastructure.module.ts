import { Module } from '@nestjs/common';
import { ErrorLoggerModule } from './error-logger/error-logger.module';

@Module({
  imports: [ErrorLoggerModule]
})
export class InfrastructureModule {}
