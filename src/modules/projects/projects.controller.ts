import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dtos/create-project.dto';
import { UpdateProjectDto } from './dtos/update-project.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiOperation({ summary: 'List all projects (steps excluded)' })
  @ApiResponse({ status: 200, description: 'Array of project summaries.' })
  findAll() {
    return this.projectsService.findAll();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get a full project by slug' })
  @ApiParam({ name: 'slug', example: 'todo-app-angular', description: 'URL-safe project slug' })
  @ApiResponse({ status: 200, description: 'Full project including steps.' })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  findBySlug(@Param('slug') slug: string) {
    return this.projectsService.findBySlug(slug);
  }

}
