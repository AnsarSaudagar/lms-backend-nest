import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StepsService } from './steps.service';
import { CreateStepDto } from './dtos/create-step.dto';

@ApiTags('Project Steps')
@Controller('/projects/:id/steps')
export class StepsController {
  constructor(private readonly stepsService: StepsService) {}

  @Post()
  @ApiOperation({ summary: 'Add a step to a project' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the parent project' })
  @ApiResponse({ status: 201, description: 'Step added. Returns the updated project.' })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  addStep(@Param('id') projectId: string, @Body() dto: CreateStepDto) {
    return this.stepsService.addStep(projectId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all steps for a project' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the parent project' })
  @ApiResponse({ status: 200, description: 'Array of project steps.' })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  getSteps(@Param('id') projectId: string) {
    return this.stepsService.getSteps(projectId);
  }

  @Delete(':stepNumber')
  @ApiOperation({ summary: 'Remove a step from a project by step number' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the parent project' })
  @ApiParam({ name: 'stepNumber', description: 'The stepNumber value of the step to remove', example: 3 })
  @ApiResponse({ status: 200, description: 'Step removed. Returns the updated project.' })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  removeStep(
    @Param('id') projectId: string,
    @Param('stepNumber') stepNumber: string,
  ) {
    return this.stepsService.removeStep(projectId, Number(stepNumber));
  }
}
