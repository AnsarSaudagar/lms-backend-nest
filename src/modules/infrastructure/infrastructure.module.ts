import { Module } from '@nestjs/common';
import { ErrorLoggerModule } from './error-logger/error-logger.module';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';

@Module({
  imports: [ErrorLoggerModule,
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: () => ({
        stores: redisStore,
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        ttl: 60, // seconds
      })
    })
  ],
  exports: [ErrorLoggerModule],
})
export class InfrastructureModule {}
