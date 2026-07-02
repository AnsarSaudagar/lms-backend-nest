import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Course } from 'src/modules/courses/schemas/course.schema';
import { CreateNewTopicDto } from './dtos/create-new-topic.dto';

@Injectable()
export class TopicsService {
    constructor(
        @InjectModel(Course.name)
        private readonly courseModel: Model<Course>,
    ) { }

    async addTopic(courseId: string, topic: CreateNewTopicDto) {
        if (!Types.ObjectId.isValid(courseId)) {
            throw new NotFoundException('Course not found');
        }

        const course = await this.courseModel.findByIdAndUpdate(
            courseId,
            { $push: { topics: topic } },
            { new: true },
        );

        if (!course) {
            throw new NotFoundException('Course not found');
        }

        return course;
    }


}
