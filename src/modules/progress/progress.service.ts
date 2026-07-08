import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  UserProjectProgress,
  UserProjectProgressDocument,
} from 'src/modules/progress/schemas/user-project-progress.schema';
import { ProjectDocument } from 'src/modules/projects/schemas/project.schema';
import { UserProjectService } from '../purchases/user-project.service';

@Injectable()
export class ProgressService {
  constructor(
    @InjectModel(UserProjectProgress.name)
    private readonly progressModel: Model<UserProjectProgressDocument>,
    @Inject(forwardRef(() => UserProjectService))
    private readonly userProjectService: UserProjectService,
  ) {}

  /** Fetches the progress row, creating it on first access. 403 if the user lacks access. */
  async getOrCreate(
    userId: string,
    projectId: string,
  ): Promise<UserProjectProgressDocument> {
    await this.assertAccessAndLoadProject(userId, projectId);
    return this.upsertRow(userId, projectId);
  }

  async updateLastVisited(
    userId: string,
    projectId: string,
    stepNumber: number,
  ): Promise<UserProjectProgressDocument> {
    const project = await this.assertAccessAndLoadProject(userId, projectId);
    this.assertStepExists(project, stepNumber);

    return this.progressModel
      .findOneAndUpdate(
        { user: userId, project: projectId },
        {
          $set: { lastVisitedStep: stepNumber },
          $setOnInsert: { user: userId, project: projectId },
        },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      )
      .exec();
  }

  async completeStep(
    userId: string,
    projectId: string,
    stepNumber: number,
  ): Promise<UserProjectProgressDocument> {
    const project = await this.assertAccessAndLoadProject(userId, projectId);
    this.assertStepExists(project, stepNumber);

    const progress = await this.progressModel
      .findOneAndUpdate(
        { user: userId, project: projectId },
        {
          $addToSet: { completedSteps: stepNumber },
          $setOnInsert: { user: userId, project: projectId },
        },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      )
      .exec();

    const totalSteps = project.steps.length;
    const completedCount = progress.completedSteps.length;

    progress.progressPercent =
      totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

    if (totalSteps > 0 && completedCount >= totalSteps && !progress.isCompleted) {
      progress.isCompleted = true;
      progress.completedAt = new Date();
    }

    await progress.save();
    return progress;
  }

  private async upsertRow(
    userId: string,
    projectId: string,
  ): Promise<UserProjectProgressDocument> {
    return this.progressModel
      .findOneAndUpdate(
        { user: userId, project: projectId },
        { $setOnInsert: { user: userId, project: projectId } },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      )
      .exec();
  }

  private async assertAccessAndLoadProject(
    userId: string,
    projectId: string,
  ): Promise<ProjectDocument> {
    const project = await this.userProjectService.getProjectOrThrow(projectId);

    const hasAccess = await this.userProjectService.hasAccess(userId, projectId);
    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return project;
  }

  private assertStepExists(project: ProjectDocument, stepNumber: number): void {
    const exists = project.steps.some((s) => s.stepNumber === stepNumber);
    if (!exists) {
      throw new BadRequestException(
        `Step ${stepNumber} does not exist in this project`,
      );
    }
  }
}
