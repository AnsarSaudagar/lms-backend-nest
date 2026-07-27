import { UseGuards, Controller, Get } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { ProgressService } from "./progress.service";

@ApiTags('Progress')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('me/progress')
export class MyProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get()
  @ApiOperation({ summary: 'Get progress across all enrolled projects' })
  @ApiResponse({ status: 200, description: 'Array of progress records.' })
  getAll(@CurrentUser('userId') userId: string) {
    return this.progressService.getAllForUser(userId);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get progress across all enrolled projects' })
  @ApiResponse({ status: 200, description: 'Array of progress records.' })
  getLimitedForDashboard(@CurrentUser('userId') userId: string) {
    return this.progressService.getAllForUser(userId, 3);
  }
}