import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Course, CourseSchema } from 'src/schemas/courses.schema';
import { TopicsController } from './topics/topics.controller';
import { TopicsService } from './topics/topics.service';
import { CategoryService } from '../categories/categories.service';
import { Category } from 'src/schemas/categories.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {name: Course.name, schema: CourseSchema},
      {name: Category.name, schema: CourseSchema},
    ])
  ],
  controllers: [CoursesController, TopicsController],
  providers: [CoursesService, TopicsService, CategoryService],
})
export class CoursesModule {}
