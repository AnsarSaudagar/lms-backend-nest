import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from 'src/modules/users/schemas/user.schema';
import { PROJECT_CATEGORY, PROJECT_DIFFICULTY } from 'src/common/constants/project.constant';
import { GENERATION_JOB_STATUS, type GenerationJobStatus } from '../content-generator.constants';

export type GenerationJobDocument = HydratedDocument<GenerationJob>;

@Schema({ timestamps: true, versionKey: false })
export class GenerationJob {
  @Prop({ required: true, unique: true, index: true })
  jobId!: string;

  @Prop({ required: true, trim: true })
  topic!: string;

  @Prop({ type: String, enum: [...PROJECT_CATEGORY, null], default: null })
  category!: string | null;

  @Prop({ type: String, enum: [...PROJECT_DIFFICULTY, null], default: null })
  difficulty!: string | null;

  @Prop({ type: Number, default: null })
  estimatedHours!: number | null;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  requestedBy!: Types.ObjectId;

  @Prop({ type: String, enum: Object.values(GENERATION_JOB_STATUS), default: GENERATION_JOB_STATUS.QUEUED, index: true })
  status!: GenerationJobStatus;

  @Prop({ type: String, default: null })
  projectSlug!: string | null;

  @Prop({ type: Number, default: null })
  stepCount!: number | null;

  @Prop({ type: String, default: null })
  errorMessage!: string | null;

  @Prop({ type: Number, default: 0 })
  attemptsMade!: number;

  @Prop({ type: Date, default: null })
  startedAt!: Date | null;

  @Prop({ type: Date, default: null })
  completedAt!: Date | null;

  @Prop({ type: Number, default: null })
  durationMs!: number | null;
}

export const GenerationJobSchema = SchemaFactory.createForClass(GenerationJob);
GenerationJobSchema.index({ requestedBy: 1, createdAt: -1 });
