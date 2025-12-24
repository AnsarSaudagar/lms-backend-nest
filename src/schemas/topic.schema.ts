import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  COURSE_STATUS,
  type CourseStatus,
} from 'src/common/constants/course-status.constant';

@Schema({ _id: false })
export class Topic {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ default: null })
  image?: string | null;

  @Prop({ trim: true })
  description?: string;

  @Prop({
    enum: Object.values(COURSE_STATUS),
    default: COURSE_STATUS.DRAFT,
    index: true,
  })
  status: CourseStatus;

  
}

export const TopicSchema = SchemaFactory.createForClass(Topic);
