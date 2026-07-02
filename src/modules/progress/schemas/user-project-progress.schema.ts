import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from 'src/modules/users/schemas/user.schema';
import { Project } from 'src/modules/projects/schemas/project.schema';

export type UserProjectProgressDocument = HydratedDocument<UserProjectProgress>;

@Schema({ timestamps: true, versionKey: false })
export class UserProjectProgress {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  user!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Project.name, required: true })
  project!: Types.ObjectId;

  @Prop({ type: [Number], default: [] })
  completedSteps!: number[];

  @Prop({ type: Number, default: 1, min: 1 })
  lastVisitedStep!: number;

  @Prop({ type: Number, default: 0, min: 0, max: 100 })
  progressPercent!: number;

  @Prop({ type: Boolean, default: false, index: true })
  isCompleted!: boolean;

  @Prop({ type: Date, default: null })
  completedAt!: Date | null;
}

export const UserProjectProgressSchema = SchemaFactory.createForClass(
  UserProjectProgress,
);

// One progress row per user per project.
UserProjectProgressSchema.index({ user: 1, project: 1 }, { unique: true });
// Filter my in-progress vs completed projects.
UserProjectProgressSchema.index({ user: 1, isCompleted: 1 });
