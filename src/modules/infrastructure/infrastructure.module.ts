import { Global, Module } from '@nestjs/common';
import { ErrorLoggerModule } from './error-logger/error-logger.module';
import { CacheModule } from '@nestjs/cache-manager';
import { CacheService } from './cache/cache.service';
import { MailService } from './mailer/mail.service';
import KeyvRedis from '@keyv/redis';

@Global()
@Module({
  imports: [ErrorLoggerModule,
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        stores: [
          new KeyvRedis('redis://localhost:6379'),
        ],
      }),
    })
  ],
  exports: [ErrorLoggerModule, CacheService, MailService],
  providers: [CacheService, MailService],
})
export class InfrastructureModule {}
