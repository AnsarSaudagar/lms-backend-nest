import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ErrorLoggerService } from './error-logger.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ADMIN_KEY } from 'src/common/constants/user-type.constant';

@ApiTags('Error Logger')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ADMIN_KEY)
@Controller('error-logger')
export class ErrorLoggerController {
  constructor(private readonly errorLoggerService: ErrorLoggerService) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve all error logs (admin use)' })
  @ApiResponse({ status: 200, description: 'Array of all logged errors.' })
  getAllErrors() {
    return this.errorLoggerService.getErrors();
  }
}
