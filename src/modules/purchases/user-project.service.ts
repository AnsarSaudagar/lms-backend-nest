import {
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  UserProject,
  UserProjectDocument,
} from 'src/modules/purchases/schemas/user-project.schema';
import { ProjectDocument } from 'src/modules/projects/schemas/project.schema';
import { ACCESS_TYPE, type AccessType } from 'src/common/constants/access-type.constant';
import { ProjectsService } from '../projects/projects.service';
import { ProgressService } from '../progress/progress.service';

@Injectable()
export class UserProjectService {
  constructor(
    @InjectModel(UserProject.name)
    private readonly userProjectModel: Model<UserProjectDocument>,
    private readonly projectsService: ProjectsService,
    @Inject(forwardRef(() => ProgressService))
    private readonly progressService: ProgressService,
  ) {}

  /** Loads a project by id or throws 404. Reused by the payment flow. */
  async getProjectOrThrow(projectId: string): Promise<ProjectDocument> {
    return this.projectsService.findOne(projectId);
  }

  /**
   * Creates the access grant. Idempotent: if the grant already exists
   * (unique {user, project} index), the existing one is returned.
   */
  async grant(
    userId: string,
    projectId: string,
    accessType: AccessType,
    payment: Types.ObjectId | null = null,
  ): Promise<UserProjectDocument> {
    try {
      return await this.userProjectModel.create({
        user: userId,
        project: projectId,
        accessType,
        payment,
      });
    } catch (error: any) {
      if (error?.code === 11000) {
        const existing = await this.userProjectModel
          .findOne({ user: userId, project: projectId })
          .exec();
        if (existing) {
          return existing;
        }
      }
      throw error;
    }
  }

  /** Grants immediate access to a free project. */
  async enrollFree(userId: string, projectId: string): Promise<UserProjectDocument> {
    const project = await this.getProjectOrThrow(projectId);

    if (project.isPaid) {
      throw new BadRequestException(
        'This is a paid project. Please purchase it first.',
      );
    }

    const existing = await this.userProjectModel
      .findOne({ user: userId, project: projectId })
      .exec();

    if (existing) {
      throw new ConflictException('You are already enrolled in this project');
    }

    const userProject = await this.grant(userId, projectId, ACCESS_TYPE.FREE);
    await this.progressService.getOrCreate(userId, projectId);

    return userProject;
  }

  async hasAccess(userId: string, projectId: string): Promise<boolean> {
    const count = await this.userProjectModel
      .countDocuments({ user: userId, project: projectId })
      .exec();
    return count > 0;
  }

  async listMyProjects(userId: string): Promise<UserProjectDocument[]> {
    return this.userProjectModel
      .find({ user: userId })
      .sort({ createdAt: -1 })
      .populate(
        'project',
        'slug title description category difficulty isPaid price',
      )
      .exec();
  }
}
