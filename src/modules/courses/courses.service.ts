import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, Types } from 'mongoose';
import {
  COURSE_STATUS,
  CourseStatus,
} from 'src/common/constants/course-status.constant';
import { Course, CourseDocument } from 'src/schemas/courses.schema';
import { FindProductFilter } from './dtos/find-product-filter';
import { CategoryService } from '../categories/categories.service';
import { Category } from 'src/schemas/categories.schema';
import { DIFFICULTY_LEVEL } from 'src/common/constants/difficulty-level.constant';
import { CourseDetailsDto } from './dtos/course-details.dto';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name)
    private readonly courseModel: Model<CourseDocument>,
    private readonly categoryService: CategoryService
  ) { }

  async create(data: Partial<Course>): Promise<Course> {
    const course = new this.courseModel({
      ...data,
      status: data.status ?? COURSE_STATUS.DRAFT,
    });

    return await course.save();
  }

  async findAll(filter?: FindProductFilter): Promise<Course[]> {
    const query: any = {};

    if (filter && filter?.status) query.status = filter.status;
    if (filter && filter?.search) query.$text = filter.search;

    return await this.courseModel.find(query).sort({ createdAt: -1 }).lean();
  }

  async findById(courseId: string): Promise<CourseDetailsDto> {
    if (!Types.ObjectId.isValid(courseId)) {
      throw new NotFoundException('Course not found');
    }

    const [course, categories] = await Promise.all([
      this.courseModel.findById(courseId).lean().exec(),
      this.categoryService.findAll(),
    ]);

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return {
      course,
      categories,
      difficultyLevel: DIFFICULTY_LEVEL
    };
  }


  async update(courseId: string, data: Partial<Course>) {

    if (!isValidObjectId(courseId)) {
      throw new BadRequestException('Invalid MongoDB ObjectId');
    }

    const course = await this.courseModel.findByIdAndUpdate(courseId, {
      $set: data,
      new: true,
    });

    if (!course) throw new NotFoundException('Course not found');

    return course;
  }

  async updateStatus(courseId: string, status: CourseStatus): Promise<Course> {
    return await this.update(courseId, { status });
  }

  async delete(courseId: string): Promise<void> {

    if (!isValidObjectId(courseId)) {
      throw new BadRequestException('Invalid MongoDB ObjectId');
    }

    const result = await this.courseModel.findByIdAndDelete(courseId);

    if (!result) {
      throw new NotFoundException('Course not found');
    }
  }
}
