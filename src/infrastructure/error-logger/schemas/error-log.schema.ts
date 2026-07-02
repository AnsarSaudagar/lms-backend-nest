import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/modules/users/schemas/user.schema';
import { Schema as MongooseSchema } from 'mongoose';

export type ErrorLoggerDocument = ErrorLogger & Document;

@Schema({
  timestamps: true,
  versionKey: false,
})
export class ErrorLogger extends Document {

  @Prop({
    required: true,
    type: MongooseSchema.Types.Mixed,
  })
  message: any;

  @Prop({
    type: Types.ObjectId,
    ref: User.name,
  })
  user_id!: Types.ObjectId;

  @Prop({
    // required: true,
  })
  url!: string;

  @Prop()
  type!: string;

  @Prop()
  browser!: string;

  @Prop()
  stack!: string;

  @Prop()
  method!: string;

  @Prop()
  host!: string;

  @Prop()
  ip!: string;

  @Prop({
    type: MongooseSchema.Types.Mixed
  })
  payload: any;
  
  @Prop({
    default: 'danger'
  })
  severity!: string;
}

export const ErrorLoggerSchema = SchemaFactory.createForClass(ErrorLogger);
