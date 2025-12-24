import { Module } from '@nestjs/common';
import { ErrorLoggerModule } from './error-logger/error-logger.module';
import { CacheModule } from '@nestjs/cache-manager';
import { CacheService } from './cache/cache.service';
import KeyvRedis from '@keyv/redis';

@Module({
  imports: [ErrorLoggerModule,
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: () => ({
        stores: new KeyvRedis('redis://localhost:6379'),
        ttl: 60, // seconds
      })
    })
  ],
  exports: [ErrorLoggerModule, CacheService],
  providers: [CacheService],
})
export class InfrastructureModule {}
