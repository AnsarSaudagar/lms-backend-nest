import { Module } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { OpenRouterService } from './open-router.service';

@Module({
  providers: [GeminiService, OpenRouterService],
  exports: [GeminiService, OpenRouterService],
})
export class AiModule {}
