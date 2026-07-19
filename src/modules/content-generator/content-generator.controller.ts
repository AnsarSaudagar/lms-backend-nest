import { Body, Controller, Get, HttpCode, NotFoundException, Param, Post, UseGuards } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ADMIN_KEY } from 'src/common/constants/user-type.constant';
import { CONTENT_GENERATION_QUEUE } from './content-generator.constants';
import { GenerateProjectDto } from './dtos/generate-project.dto';
import { GenerationHistoryService } from './generation-history.service';

@ApiTags('Admin / Content Generator')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ADMIN_KEY)
@Controller('admin/generator')
export class ContentGeneratorController {
  constructor(
    @InjectQueue(CONTENT_GENERATION_QUEUE) private readonly queue: Queue,
    private readonly generationHistoryService: GenerationHistoryService,
  ) {}

  @Post('projects')
  @HttpCode(202)
  @ApiOperation({ summary: 'Queue a project tutorial generation job for a topic. Jobs run one at a time.' })
  @ApiResponse({ status: 202, description: 'Job queued. Poll GET /admin/generator/projects/:jobId for the result.' })
  async queueGeneration(@CurrentUser('userId') userId: string, @Body() dto: GenerateProjectDto) {
    const job = await this.queue.add('generate', dto);
    await this.generationHistoryService.recordQueued(String(job.id), dto, userId);
    return { jobId: job.id, status: 'queued' };
  }

  @Get('projects/:jobId')
  @ApiOperation({ summary: 'Check the status/result of a queued generation job' })
  @ApiParam({ name: 'jobId' })
  @ApiResponse({ status: 404, description: 'No job with this id.' })
  async getJobStatus(@Param('jobId') jobId: string) {
    const job = await this.queue.getJob(jobId);
    if (!job) {
      throw new NotFoundException('No generation job found with this id');
    }

    const state = await job.getState();
    return {
      jobId: job.id,
      status: state,
      topic: job.data.topic,
      result: state === 'completed' ? job.returnvalue : undefined,
      error: state === 'failed' ? job.failedReason : undefined,
    };
  }

  @Post('queue/pause')
  @ApiOperation({ summary: 'Pause the queue — in-flight job finishes, no new jobs start until resumed' })
  async pauseQueue() {
    await this.queue.pause();
    return { status: 'paused' };
  }

  @Post('queue/resume')
  @ApiOperation({ summary: 'Resume a paused queue' })
  async resumeQueue() {
    await this.queue.resume();
    return { status: 'resumed' };
  }

  @Get('queue/status')
  @ApiOperation({ summary: 'Queue-wide counts and paused state' })
  async getQueueStatus() {
    const [isPaused, counts] = await Promise.all([
      this.queue.isPaused(),
      this.queue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed'),
    ]);
    return { paused: isPaused, counts };
  }

  @Get('history')
  @ApiOperation({ summary: 'Permanent history of all generation jobs, newest first (survives Redis/queue cleanup)' })
  async getHistory() {
    return this.generationHistoryService.listHistory();
  }

  @Get('history/:jobId')
  @ApiOperation({ summary: 'Permanent history record for one job' })
  @ApiParam({ name: 'jobId' })
  @ApiResponse({ status: 404, description: 'No history record with this job id.' })
  async getHistoryEntry(@Param('jobId') jobId: string) {
    const entry = await this.generationHistoryService.getHistoryByJobId(jobId);
    if (!entry) {
      throw new NotFoundException('No history record found with this job id');
    }
    return entry;
  }
}
