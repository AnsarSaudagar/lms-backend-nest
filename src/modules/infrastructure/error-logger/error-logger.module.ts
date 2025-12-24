import { Module } from '@nestjs/common';
import { ErrorLoggerService } from './error-logger.service';
import { ErrorLoggerController } from './error-logger.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ErrorLogger, ErrorLoggerSchema } from 'src/schemas/errorLogger.schema';

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
