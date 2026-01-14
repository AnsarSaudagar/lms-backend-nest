import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Delete,
  Put,
  UseGuards,
  UseInterceptors,
  UploadedFile
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { type NewCourseDto } from './dtos/newCourse.dto';
import { Course } from 'src/schemas/courses.schema';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryStorageConfig } from 'src/config/cloudinary-storage';

@UseGuards(JwtAuthGuard)
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

  @Post('image/:id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: CloudinaryStorageConfig,
    }),
  )
  uploadImage(@UploadedFile() file: any, @Param('id') id: string) {
    
    const course = this.coursesService.addImage(id, file.path);
    
    return {
      url: file.path,          // Cloudinary URL
      public_id: file.filename,
      course
    };
  }
}
