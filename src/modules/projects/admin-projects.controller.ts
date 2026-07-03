import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { ImportProjectDto } from './dtos/import-project.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ADMIN_KEY } from 'src/common/constants/user-type.constant';

@ApiTags('Admin / Projects')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ADMIN_KEY)
@Controller('admin/projects')
export class AdminProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post('import')
  @ApiOperation({ summary: 'Import a full project with all steps from a generated JSON file' })
  @ApiResponse({ status: 201, description: 'Project and steps imported successfully.' })
  @ApiResponse({ status: 400, description: 'Validation failed.' })
  @ApiResponse({ status: 409, description: 'A project with this slug already exists.' })
  import(@Body() dto: ImportProjectDto) {
    return this.projectsService.import(dto);
  }
}
