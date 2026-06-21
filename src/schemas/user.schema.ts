import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { LEARNER_KEY, USER_TYPE } from 'src/common/constants/user-type.constant';

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
  email!: string;

  @Prop({
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50,
  })
  firstName!: string;
  
  @Prop({
    required: false,
    trim: true,
    maxlength: 50,
  })
  middleName!: string;

  @Prop({
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50,
  })
  lastName!: string;

  @Prop({
    required: true,
    // select: false,
  })
  password!: string;

  @Prop()
  mobileNumber!: number;

  @Prop({
    index: true,
    enum: Object.keys(USER_TYPE),
    default: LEARNER_KEY,
  })
  role!: string;

  @Prop({
    default: true,
    index: true,
  })
  isActive!: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
