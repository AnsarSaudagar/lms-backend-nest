import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  ParseUUIDPipe,
  Delete
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { type NewCourseDto } from './dtos/newCourse.dto';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  createCourse(@Body() createCourseDto: NewCourseDto) {
    return this.coursesService.create(createCourseDto);
  }

  @Get()
  findAllCourses() {
    return this.coursesService.findAll();
  }

  @Get(':id')
  findCourseById(@Param('id', ParseUUIDPipe) id: string) {
    return this.coursesService.findById(id);
  }

  @Delete(':id')
  deleteCourseById(@Param('id') id: string){
    return this.coursesService.delete(id);
  }
}
