import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ADMIN_KEY } from 'src/common/constants/user-type.constant';
import { ContentGeneratorService } from './content-generator.service';
import { GenerateProjectDto } from './dtos/generate-project.dto';

@ApiTags('Admin / Content Generator')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ADMIN_KEY)
@Controller('admin/generator')
export class ContentGeneratorController {
  constructor(private readonly contentGeneratorService: ContentGeneratorService) {}

  @Post('projects')
  @ApiOperation({ summary: 'Generate a full project tutorial JSON from a topic via AI, save it to generated/{slug}.json' })
  @ApiResponse({ status: 201, description: 'Project generated and saved.' })
  @ApiResponse({ status: 400, description: 'AI output failed schema validation.' })
  generateProject(@Body() dto: GenerateProjectDto) {
    return this.contentGeneratorService.generateProject(dto);
  }
}
