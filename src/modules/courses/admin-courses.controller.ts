import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Delete,
  Put,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CoursesService } from './courses.service';
import { NewCourseDto } from './dtos/newCourse.dto';
import { Course } from 'src/schemas/courses.schema';
import { CloudinaryStorageConfig } from 'src/config/cloudinary-storage';
import { CourseGeneratorService } from './course-generator.service';

@ApiTags('Admin / Courses')
@ApiBearerAuth('access-token')
@Controller('admin/courses')
export class AdminCoursesController {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly generatorService: CourseGeneratorService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new course' })
  @ApiResponse({ status: 201, description: 'Course created.' })
  @ApiResponse({ status: 400, description: 'Validation failed.' })
  createCourse(@Body() createCourseDto: NewCourseDto) {
    return this.coursesService.create(createCourseDto);
  }

  @Get('test')
  @ApiOperation({ summary: 'Test AI course generation (dev only)', deprecated: true })
  async testCourse() {
    return await this.generatorService.generateCourse('What is angular');
  }

  @Get()
  @ApiOperation({ summary: 'Get all courses (full data, admin view)' })
  @ApiResponse({ status: 200, description: 'Array of all courses.' })
  findAllCourses() {
    return this.coursesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a course by ID (admin view)' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the course' })
  @ApiResponse({ status: 200, description: 'Course found.' })
  @ApiResponse({ status: 404, description: 'Course not found.' })
  findCourseById(@Param('id') id: string) {
    return this.coursesService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a course by ID' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the course' })
  @ApiResponse({ status: 200, description: 'Course updated.' })
  @ApiResponse({ status: 404, description: 'Course not found.' })
  updateCourse(@Param('id') id: string, @Body() updateCourse: Partial<Course>) {
    return this.coursesService.update(id, updateCourse);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a course by ID' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the course' })
  @ApiResponse({ status: 200, description: 'Course deleted.' })
  @ApiResponse({ status: 404, description: 'Course not found.' })
  deleteCourseById(@Param('id') id: string) {
    return this.coursesService.delete(id);
  }

  @Post('image/:id')
  @ApiOperation({ summary: 'Upload a cover image for a course' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the course' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: { type: 'string', format: 'binary', description: 'Course cover image file' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Image uploaded. Returns Cloudinary URL and course.' })
  @UseInterceptors(FileInterceptor('image', { storage: CloudinaryStorageConfig }))
  uploadImage(@UploadedFile() file: any, @Param('id') id: string) {
    const course = this.coursesService.addImage(id, file.path);
    return { url: file.path, public_id: file.filename, course };
  }
}
