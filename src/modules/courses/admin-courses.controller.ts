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
import { NewCourseDto } from './dtos/new-course.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ADMIN_KEY } from 'src/common/constants/user-type.constant';
import { UpdateCourseDto } from './dtos/update-course.dto';

@ApiTags('Admin / Courses')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ADMIN_KEY)
@Controller('admin/courses')
export class AdminCoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new course' })
  @ApiResponse({ status: 201, description: 'Course created.' })
  @ApiResponse({ status: 400, description: 'Validation failed.' })
  createCourse(@Body() createCourseDto: NewCourseDto) {
    return this.coursesService.create(createCourseDto);
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
  updateCourse(@Param('id') id: string, @Body() updateCourse: UpdateCourseDto) {
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
  @UseInterceptors(FileInterceptor('image'))
  uploadImage(@UploadedFile() file: any, @Param('id') id: string) {
    const course = this.coursesService.addImage(id, file.path);
    return { url: file.path, public_id: file.filename, course };
  }
}
