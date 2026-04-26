import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ErrorLoggerService } from './error-logger.service';

@ApiTags('Error Logger')
@ApiBearerAuth('access-token')
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
