import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Project } from 'src/schemas/project.schema';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ImportProjectDto } from './dto/import-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name)
    private readonly projectModel: Model<Project>,
  ) {}

  create(dto: CreateProjectDto) {
    return this.projectModel.create(dto);
  }

  findAll() {
    return this.projectModel
      .find()
      .select('-steps')
      .lean();
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

  async findBySlug(slug: string) {
    const project = await this.projectModel.findOne({ slug });
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
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
