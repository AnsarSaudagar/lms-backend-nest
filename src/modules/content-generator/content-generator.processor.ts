import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { CONTENT_GENERATION_QUEUE } from './content-generator.constants';
import { ContentGeneratorService } from './content-generator.service';
import { GenerateProjectDto } from './dtos/generate-project.dto';

/**
 * concurrency: 1 — generation makes several sequential OpenRouter calls per
 * job (skeleton + one per step); running jobs one at a time keeps requests
 * from piling up against the free-tier rate limit across multiple topics.
 */
@Processor(CONTENT_GENERATION_QUEUE, { concurrency: 1 })
export class ContentGeneratorProcessor extends WorkerHost {
  private readonly logger = new Logger(ContentGeneratorProcessor.name);

  constructor(private readonly contentGeneratorService: ContentGeneratorService) {
    super();
  }

  async process(job: Job<GenerateProjectDto>) {
    this.logger.log(`Generating project for topic "${job.data.topic}" (job ${job.id})`);
    return this.contentGeneratorService.generateProject(job.data);
  }
}
