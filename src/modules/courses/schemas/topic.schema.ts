import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { TOPIC_STATUS, type TopicStatus } from 'src/common/constants/topic-status.constant';

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Topic {
  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ type: String, default: null })
  image?: string | null;

  @Prop({ trim: true })
  description?: string;

  @Prop({ type: String, default: null })
  shortDescription!: string;

  @Prop({
    type: Number,
    required: false,
    min: 0,
    default: 0
  })
  duration!: number; // in seconds

  @Prop({
    default: []
  })
  videos!: string[];

  @Prop({
    enum: Object.values(TOPIC_STATUS),
    default: TOPIC_STATUS.ACTIVE,
    index: true,
  })
  status!: TopicStatus;
}

export const TopicSchema = SchemaFactory.createForClass(Topic);
