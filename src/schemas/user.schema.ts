import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({
  timestamps: true,
  versionKey: false,
})
export class User extends Document {

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  })
  email: string;

  @Prop({
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50,
  })
  firstName: string;
  @Prop({
    required: false,
    trim: true,
    minlength: 2,
    maxlength: 50,
  })
  middleName: string;

  @Prop({
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50,
  })
  lastName: string;

  @Prop({
    required: true,
    // select: false,
  })
  password: string;

  @Prop()
  mobileNumber: number;

  @Prop({
    index: true,
    enum: ['LEARNER', 'ADMIN'],
    default: 'LEARNER',
  })
  role: string;

  @Prop({
    default: true,
    index: true,
  })
  isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
