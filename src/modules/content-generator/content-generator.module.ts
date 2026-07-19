import { Module } from '@nestjs/common';
import { AiModule } from 'src/infrastructure/ai/ai.module';
import { ContentGeneratorService } from './content-generator.service';
import { ContentGeneratorController } from './content-generator.controller';

@Module({
  imports: [AiModule],
  controllers: [ContentGeneratorController],
  providers: [ContentGeneratorService],
})
export class ContentGeneratorModule {}
