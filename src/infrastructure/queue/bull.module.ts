import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get('REDIS_HOST', 'localhost'),
          port: config.get('REDIS_PORT', 6379),
          // BullMQ workers block on Redis commands — the client must not
          // give up retrying mid-block, or jobs silently stop processing.
          maxRetriesPerRequest: null,
        },
      }),
    }),
  ],
  exports: [BullModule],
})
export class QueueModule {}
