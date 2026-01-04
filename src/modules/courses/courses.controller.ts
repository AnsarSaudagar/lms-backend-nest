import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  ParseUUIDPipe,
  Delete,
  Put
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { type NewCourseDto } from './dtos/newCourse.dto';
import { Course } from 'src/schemas/courses.schema';

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
  findCourseById(@Param('id') id: string) {
    return this.coursesService.findById(id);
  }

  @Put(":id")
  updateCourse(@Param('id') id: string, @Body() updateCourse: Partial<Course>){
    return this.coursesService.update(id, updateCourse);
  }

  @Delete(':id')
  deleteCourseById(@Param('id') id: string){
    return this.coursesService.delete(id);
  }
}
