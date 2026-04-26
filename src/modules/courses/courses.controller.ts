import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CoursesService } from './courses.service';

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  @ApiOperation({ summary: 'List all published courses (limited fields)' })
  @ApiResponse({ status: 200, description: 'Array of course summaries.' })
  findAllCourses() {
    return this.coursesService.findAllWithLimitedData();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get full course details by ID' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the course' })
  @ApiResponse({ status: 200, description: 'Full course object including topics.' })
  @ApiResponse({ status: 404, description: 'Course not found.' })
  findCourseById(@Param('id') id: string) {
    return this.coursesService.findById(id);
  }
}
