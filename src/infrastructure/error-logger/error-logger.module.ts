import { Global, Module } from '@nestjs/common';
import { ErrorLoggerService } from './error-logger.service';
import { ErrorLoggerController } from './error-logger.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ErrorLogger, ErrorLoggerSchema } from './schemas/error-log.schema';

// Global: the AllExceptionsFilter (registered via APP_FILTER in AppModule)
// injects ErrorLoggerService from the root context.
@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ErrorLogger.name, schema: ErrorLoggerSchema },
    ]),
  ],
  controllers: [ErrorLoggerController],
  providers: [ErrorLoggerService],
  exports: [ErrorLoggerService]
})
export class ErrorLoggerModule {}
