import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MongooseModule } from '@nestjs/mongoose';
import { AiModule } from 'src/infrastructure/ai/ai.module';
import { ProjectsModule } from '../projects/projects.module';
import { CONTENT_GENERATION_QUEUE } from './content-generator.constants';
import { GenerationJob, GenerationJobSchema } from './schemas/generation-job.schema';
import { ContentGeneratorService } from './content-generator.service';
import { ContentGeneratorController } from './content-generator.controller';
import { ContentGeneratorProcessor } from './content-generator.processor';
import { GenerationHistoryService } from './generation-history.service';

@Module({
  imports: [
    AiModule,
    ProjectsModule,
    BullModule.registerQueue({ name: CONTENT_GENERATION_QUEUE }),
    MongooseModule.forFeature([{ name: GenerationJob.name, schema: GenerationJobSchema }]),
  ],
  controllers: [ContentGeneratorController],
  providers: [ContentGeneratorService, ContentGeneratorProcessor, GenerationHistoryService],
})
export class ContentGeneratorModule {}
