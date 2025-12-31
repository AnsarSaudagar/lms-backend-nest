import { Body, Controller, Post } from '@nestjs/common';
import { CoursesService } from './courses.service';
import type { NewCourseDto } from './dtos/newCourse.dto';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) { }

  @Post()
  create(@Body() course: NewCourseDto) {

  }
}
