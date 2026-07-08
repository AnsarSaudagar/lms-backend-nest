import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Project, ProjectDocument } from 'src/modules/projects/schemas/project.schema';
import { CreateProjectDto } from './dtos/create-project.dto';
import { UpdateProjectDto } from './dtos/update-project.dto';
import { ImportProjectDto } from './dtos/import-project.dto';
import { UserProject, UserProjectDocument } from '../purchases/schemas/user-project.schema';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
    @InjectModel(UserProject.name)
    private readonly userProjectModel: Model<UserProjectDocument>,
  ) {}

  create(dto: CreateProjectDto) {
    return this.projectModel.create(dto);
  }

  async findAll(userId: string) {
    const enrolled = await this.userProjectModel.distinct('project', { user: userId });

    return this.projectModel.aggregate([
      {
        $addFields: {
          stepCount: { $size: '$steps' },
          isEnrolled: { $in: [{ $toString: '$_id' }, enrolled.map(String)] },
        },
      },
      { $project: { steps: 0 } },
    ]);
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Project not found');
    }

    const project = await this.projectModel.findById(id);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async findBySlugAndUserProjectStatus(slug: string, userId: string) {
    const project = await this.projectModel.findOne({ slug });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    const isEnrolled = await this.userProjectModel.exists({ user: userId, project: project.id });

    return { ...project.toObject(), isEnrolled: !!isEnrolled };
  }

  async update(id: string, dto: UpdateProjectDto) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Project not found');
    }

    const project = await this.projectModel.findByIdAndUpdate(id, dto, {
      new: true,
      runValidators: true,
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Project not found');
    }

    const project = await this.projectModel.findByIdAndDelete(id);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return { deleted: true };
  }

  async import(dto: ImportProjectDto) {
    const existing = await this.projectModel.findOne({ slug: dto.project.slug });
    if (existing) {
      throw new ConflictException(`Project with slug "${dto.project.slug}" already exists`);
    }

    const sortedSteps = [...dto.steps].sort((a, b) => a.stepNumber - b.stepNumber);

    return this.projectModel.create({
      ...dto.project,
      steps: sortedSteps,
    });
  }
}
