import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  COURSE_STATUS,
  type CourseStatus,
} from 'src/common/constants/course-status.constant';
import { Topic, TopicSchema } from './topic.schema';
import { DIFFICULTY_LEVEL, type DifficultyLevel } from 'src/common/constants/difficulty-level.constant';
import { Category } from './categories.schema';

export type CourseDocument = HydratedDocument<Course>;

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Course {
  @Prop({
    required: true,
    unique: true,
    trim: true,
    index: true,
  })
  title!: string;

  @Prop({
    trim: true,
  })
  description?: string;

  @Prop({
    enum: Object.values(COURSE_STATUS),
    default: COURSE_STATUS.DRAFT,
    index: true,
  })
  status!: CourseStatus;

  @Prop({
    type: [TopicSchema],
    default: [],
  })
  topics!: Topic[];

  @Prop({
    type: Number,
    required: true,
    min: 0,
    default: 0
  })
  price!: number;

  @Prop({
    type: String,
    index: true,
    enum: Object.keys(DIFFICULTY_LEVEL),
    default: 'BEGINNER',
  })
  difficultyLevel!: string;

  @Prop({
    type: Types.ObjectId,
    ref: Category.name,
    required: true
  })
  category!: Types.ObjectId;

  @Prop({
    default: null
  })
  imageUrl!: string;
}

export const CourseSchema = SchemaFactory.createForClass(Course);

CourseSchema.virtual('topicCount').get(function () {
  return this.topics.length;
});

CourseSchema.index(
  { _id: 1, 'topics.name': 1 },
  { unique: true, sparse: true },
);

CourseSchema.index({
  title: 'text',
  description: 'text',
});

CourseSchema.virtual('image').get(function(){
  return this.imageUrl;
});
