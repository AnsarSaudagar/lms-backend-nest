import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GenerationJob, GenerationJobDocument } from './schemas/generation-job.schema';
import { GENERATION_JOB_STATUS } from './content-generator.constants';
import { GenerateProjectDto } from './dtos/generate-project.dto';

@Injectable()
export class GenerationHistoryService {
  constructor(
    @InjectModel(GenerationJob.name) private readonly generationJobModel: Model<GenerationJobDocument>,
  ) {}

  async recordQueued(jobId: string, dto: GenerateProjectDto, requestedBy: string) {
    return this.generationJobModel.create({
      jobId,
      topic: dto.topic,
      category: dto.category ?? null,
      difficulty: dto.difficulty ?? null,
      estimatedHours: dto.estimatedHours ?? null,
      requestedBy,
      status: GENERATION_JOB_STATUS.QUEUED,
    });
  }

  async recordStarted(jobId: string, attemptsMade: number) {
    await this.generationJobModel.updateOne(
      { jobId },
      { status: GENERATION_JOB_STATUS.PROCESSING, startedAt: new Date(), attemptsMade },
    );
  }

  async recordCompleted(jobId: string, projectSlug: string, stepCount: number) {
    const job = await this.generationJobModel.findOne({ jobId }).exec();
    const completedAt = new Date();
    const durationMs = job?.startedAt ? completedAt.getTime() - job.startedAt.getTime() : null;

    await this.generationJobModel.updateOne(
      { jobId },
      { status: GENERATION_JOB_STATUS.COMPLETED, projectSlug, stepCount, completedAt, durationMs },
    );
  }

  async recordFailed(jobId: string, errorMessage: string) {
    const job = await this.generationJobModel.findOne({ jobId }).exec();
    const completedAt = new Date();
    const durationMs = job?.startedAt ? completedAt.getTime() - job.startedAt.getTime() : null;

    await this.generationJobModel.updateOne(
      { jobId },
      { status: GENERATION_JOB_STATUS.FAILED, errorMessage, completedAt, durationMs },
    );
  }

  /** Appends one line to the job's live progress log — the frontend polls this for a step-by-step view. */
  async appendLog(jobId: string, message: string) {
    await this.generationJobModel.updateOne(
      { jobId },
      { $push: { logs: { at: new Date(), message } } },
    );
  }

  /** Records which model actually answered, so a fallback switch away from the primary is visible. */
  async setModel(jobId: string, model: string, primaryModel: string) {
    await this.generationJobModel.updateOne({ jobId }, { currentModel: model });
    if (model !== primaryModel) {
      await this.appendLog(jobId, `Model switched to "${model}" (primary "${primaryModel}" unavailable/rate-limited)`);
    }
  }

  async setStepsCompleted(jobId: string, stepsCompleted: number) {
    await this.generationJobModel.updateOne({ jobId }, { stepsCompleted });
  }

  async listHistory(requestedBy?: string): Promise<GenerationJobDocument[]> {
    const filter = requestedBy ? { requestedBy } : {};
    return this.generationJobModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  async getHistoryByJobId(jobId: string): Promise<GenerationJobDocument | null> {
    return this.generationJobModel.findOne({ jobId }).exec();
  }
}
