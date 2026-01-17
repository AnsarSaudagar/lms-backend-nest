import {
  Controller,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

// @UseGuards(JwtAuthGuard)
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  findAllCourses() {
    return this.coursesService.findAllWithLimitedData();
  }

  @Get(':id')
  findCourseById(@Param('id') id: string) {
    return this.coursesService.findById(id);
  }

}
