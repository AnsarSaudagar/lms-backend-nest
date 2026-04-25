import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { StepsService } from './steps.service';
import { CreateStepDto } from './dtos/create-step.dto';

@Controller('/projects/:id/steps')
export class StepsController {
  constructor(private readonly stepsService: StepsService) {}

  @Post()
  addStep(@Param('id') projectId: string, @Body() dto: CreateStepDto) {
    return this.stepsService.addStep(projectId, dto);
  }

  @Get()
  getSteps(@Param('id') projectId: string) {
    return this.stepsService.getSteps(projectId);
  }

  @Delete(':stepNumber')
  removeStep(
    @Param('id') projectId: string,
    @Param('stepNumber') stepNumber: string,
  ) {
    return this.stepsService.removeStep(projectId, Number(stepNumber));
  }
}
