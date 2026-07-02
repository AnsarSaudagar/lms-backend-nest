import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Course, CourseSchema } from 'src/modules/courses/schemas/course.schema';
import { TopicsController } from './topics/topics.controller';
import { TopicsService } from './topics/topics.service';
import { AdminCoursesController } from './admin-courses.controller';
import { CourseGeneratorService } from './course-generator.service';
import { CategoriesModule } from '../categories/categories.module';
import { StorageModule } from 'src/infrastructure/storage/storage.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
    ]),
    CategoriesModule,
    StorageModule,
  ],
  controllers: [CoursesController, TopicsController, AdminCoursesController],
  providers: [CoursesService, TopicsService, CourseGeneratorService],
})
export class CoursesModule {}
