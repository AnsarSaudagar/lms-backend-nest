import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ImportProjectDto } from './dto/import-project.dto';

@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project (metadata only, no steps)' })
  @ApiResponse({ status: 201, description: 'Project created.' })
  @ApiResponse({ status: 400, description: 'Validation failed.' })
  create(@Body() dto: CreateProjectDto) {
    return this.projectsService.create(dto);
  }

  @Post('import')
  @ApiOperation({ summary: 'Import a full project with all steps from a generated JSON file' })
  @ApiResponse({ status: 201, description: 'Project and steps imported successfully.' })
  @ApiResponse({ status: 400, description: 'Validation failed.' })
  @ApiResponse({ status: 409, description: 'A project with this slug already exists.' })
  import(@Body() dto: ImportProjectDto) {
    return this.projectsService.import(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all projects (steps excluded)' })
  @ApiResponse({ status: 200, description: 'Array of project summaries.' })
  findAll() {
    return this.projectsService.findAll();
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get a full project by slug' })
  @ApiParam({ name: 'slug', example: 'todo-app-angular', description: 'URL-safe project slug' })
  @ApiResponse({ status: 200, description: 'Full project including steps.' })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  findBySlug(@Param('slug') slug: string) {
    return this.projectsService.findBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a full project by ID' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the project' })
  @ApiResponse({ status: 200, description: 'Full project including steps.' })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update project metadata by ID' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the project' })
  @ApiResponse({ status: 200, description: 'Project updated.' })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.projectsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a project by ID' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the project' })
  @ApiResponse({ status: 200, description: 'Project deleted.' })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }
}
