import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  PAYMENT_STATUS,
  type PaymentStatus,
} from 'src/common/constants/payment-status.constant';
import { User } from 'src/modules/users/schemas/user.schema';
import { Project } from 'src/modules/projects/schemas/project.schema';

export type PaymentDocument = HydratedDocument<Payment>;

@Schema({ timestamps: true, versionKey: false })
export class Payment {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  user!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Project.name, required: true, index: true })
  project!: Types.ObjectId;

  @Prop({ required: true, unique: true, index: true, trim: true })
  orderId!: string;

  @Prop({ type: String, trim: true, default: null })
  paymentId!: string | null;

  @Prop({ type: Number, required: true, min: 0 })
  amount!: number;

  @Prop({ default: 'INR', trim: true })
  currency!: string;

  @Prop({
    enum: Object.values(PAYMENT_STATUS),
    default: PAYMENT_STATUS.CREATED,
    index: true,
  })
  status!: PaymentStatus;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

PaymentSchema.index({ user: 1, project: 1 });
