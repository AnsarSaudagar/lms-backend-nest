import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { TOPIC_STATUS, type TopicStatus } from 'src/common/constants/topic-status.constant';

@Schema({ _id: false })
export class Topic {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: String, default: null })
  image?: string | null;

  @Prop({ trim: true })
  description?: string;

  @Prop({
    enum: Object.values(TOPIC_STATUS),
    default: TOPIC_STATUS.DRAFT,
    index: true,
  })
  status: TopicStatus;
}

export const TopicSchema = SchemaFactory.createForClass(Topic);
