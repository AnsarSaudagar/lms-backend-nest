import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AiModule } from 'src/infrastructure/ai/ai.module';
import { ProjectsModule } from '../projects/projects.module';
import { CONTENT_GENERATION_QUEUE } from './content-generator.constants';
import { ContentGeneratorService } from './content-generator.service';
import { ContentGeneratorController } from './content-generator.controller';
import { ContentGeneratorProcessor } from './content-generator.processor';

@Module({
  imports: [AiModule, ProjectsModule, BullModule.registerQueue({ name: CONTENT_GENERATION_QUEUE })],
  controllers: [ContentGeneratorController],
  providers: [ContentGeneratorService, ContentGeneratorProcessor],
})
export class ContentGeneratorModule {}
