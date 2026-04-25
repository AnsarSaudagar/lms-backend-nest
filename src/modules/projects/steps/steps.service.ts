import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Project } from 'src/schemas/project.schema';
import { CreateStepDto } from './dtos/create-step.dto';

@Injectable()
export class StepsService {
  constructor(
    @InjectModel(Project.name)
    private readonly projectModel: Model<Project>,
  ) {}

  async addStep(projectId: string, dto: CreateStepDto) {
    if (!Types.ObjectId.isValid(projectId)) {
      throw new NotFoundException('Project not found');
    }

    const project = await this.projectModel.findByIdAndUpdate(
      projectId,
      { $push: { steps: dto } },
      { new: true, runValidators: true },
    );

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async getSteps(projectId: string) {
    if (!Types.ObjectId.isValid(projectId)) {
      throw new NotFoundException('Project not found');
    }

    const project = await this.projectModel
      .findById(projectId)
      .select('steps slug title')
      .lean();

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project.steps;
  }

  async removeStep(projectId: string, stepNumber: number) {
    if (!Types.ObjectId.isValid(projectId)) {
      throw new NotFoundException('Project not found');
    }

    const project = await this.projectModel.findByIdAndUpdate(
      projectId,
      { $pull: { steps: { stepNumber } } },
      { new: true },
    );

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }
}
