import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StepsService } from './steps.service';
import { CreateStepDto } from './dtos/create-step.dto';

@ApiTags('Project Steps')
@Controller('/projects/:id/steps')
export class StepsController {
  constructor(private readonly stepsService: StepsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all steps for a project' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the parent project' })
  @ApiResponse({ status: 200, description: 'Array of project steps.' })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  getSteps(@Param('id') projectId: string) {
    return this.stepsService.getSteps(projectId);
  }

}
