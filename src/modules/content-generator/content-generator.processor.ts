import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { CONTENT_GENERATION_QUEUE } from './content-generator.constants';
import { ContentGeneratorService } from './content-generator.service';
import { GenerationHistoryService } from './generation-history.service';
import { GenerateProjectDto } from './dtos/generate-project.dto';

/**
 * concurrency: 1 — generation makes several sequential OpenRouter calls per
 * job (skeleton + one per step); running jobs one at a time keeps requests
 * from piling up against the free-tier rate limit across multiple topics.
 */
@Processor(CONTENT_GENERATION_QUEUE, { concurrency: 1 })
export class ContentGeneratorProcessor extends WorkerHost {
  private readonly logger = new Logger(ContentGeneratorProcessor.name);

  constructor(
    private readonly contentGeneratorService: ContentGeneratorService,
    private readonly generationHistoryService: GenerationHistoryService,
  ) {
    super();
  }

  async process(job: Job<GenerateProjectDto>) {
    this.logger.log(`Generating project for topic "${job.data.topic}" (job ${job.id})`);
    return this.contentGeneratorService.generateProject(job.data);
  }

  @OnWorkerEvent('active')
  async onActive(job: Job) {
    await this.generationHistoryService.recordStarted(String(job.id), job.attemptsMade);
  }

  @OnWorkerEvent('completed')
  async onCompleted(job: Job) {
    const generated = job.returnvalue?.generated;
    await this.generationHistoryService.recordCompleted(
      String(job.id),
      generated?.project?.slug ?? 'unknown',
      generated?.steps?.length ?? 0,
    );
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job | undefined, error: Error) {
    if (!job) return;
    await this.generationHistoryService.recordFailed(String(job.id), error.message);
  }
}
