import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ProgressService } from './progress.service';
import { StepNumberDto } from './dtos/step-number.dto';

@ApiTags('Progress')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('me/projects/:projectId/progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get()
  @ApiOperation({ summary: 'Get the current user’s progress for a project' })
  @ApiParam({ name: 'projectId', description: 'MongoDB ObjectId of the project' })
  @ApiResponse({ status: 200, description: 'Progress record (created on first access).' })
  @ApiResponse({ status: 403, description: 'You do not have access to this project.' })
  getProgress(
    @CurrentUser('userId') userId: string,
    @Param('projectId') projectId: string,
  ) {
    return this.progressService.getOrCreate(userId, projectId);
  }

  @Patch('last-visited')
  @ApiOperation({ summary: 'Update the last visited step' })
  @ApiParam({ name: 'projectId', description: 'MongoDB ObjectId of the project' })
  @ApiResponse({ status: 200, description: 'Updated progress record.' })
  @ApiResponse({ status: 400, description: 'Step does not exist in this project.' })
  @ApiResponse({ status: 403, description: 'You do not have access to this project.' })
  updateLastVisited(
    @CurrentUser('userId') userId: string,
    @Param('projectId') projectId: string,
    @Body() dto: StepNumberDto,
  ) {
    return this.progressService.updateLastVisited(userId, projectId, dto.stepNumber);
  }

  @Post('complete-step')
  @ApiOperation({ summary: 'Mark a step as completed' })
  @ApiParam({ name: 'projectId', description: 'MongoDB ObjectId of the project' })
  @ApiResponse({ status: 201, description: 'Updated progress with recalculated percentage.' })
  @ApiResponse({ status: 400, description: 'Step does not exist in this project.' })
  @ApiResponse({ status: 403, description: 'You do not have access to this project.' })
  completeStep(
    @CurrentUser('userId') userId: string,
    @Param('projectId') projectId: string,
    @Body() dto: StepNumberDto,
  ) {
    return this.progressService.completeStep(userId, projectId, dto.stepNumber);
  }
}


