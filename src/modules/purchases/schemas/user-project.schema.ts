import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  ACCESS_TYPE,
  type AccessType,
} from 'src/common/constants/access-type.constant';
import { User } from 'src/modules/users/schemas/user.schema';
import { Project } from 'src/modules/projects/schemas/project.schema';
import { Payment } from './payment.schema';

export type UserProjectDocument = HydratedDocument<UserProject>;

@Schema({ timestamps: true, versionKey: false })
export class UserProject {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  user!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Project.name, required: true })
  project!: Types.ObjectId;

  @Prop({ enum: Object.values(ACCESS_TYPE), required: true })
  accessType!: AccessType;

  @Prop({ type: Types.ObjectId, ref: Payment.name, default: null })
  payment!: Types.ObjectId | null;
}

export const UserProjectSchema = SchemaFactory.createForClass(UserProject);

// One access grant per user per project (also prevents duplicate enrollment).
UserProjectSchema.index({ user: 1, project: 1 }, { unique: true });
// "My projects" listing, newest first.
UserProjectSchema.index({ user: 1, createdAt: -1 });
