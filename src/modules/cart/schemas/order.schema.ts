import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { PAYMENT_STATUS, type PaymentStatus } from 'src/common/constants/payment-status.constant';
import { User } from 'src/modules/users/schemas/user.schema';
import { Project } from 'src/modules/projects/schemas/project.schema';

export type OrderDocument = HydratedDocument<Order>;

@Schema({ _id: false })
export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: Project.name, required: true })
  project!: Types.ObjectId;

  @Prop({ type: Number, required: true, min: 0 })
  price!: number;
}
export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema({ timestamps: true, versionKey: false })
export class Order {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  user!: Types.ObjectId;

  @Prop({ type: [OrderItemSchema], required: true })
  items!: OrderItem[];

  @Prop({ required: true, unique: true, index: true, trim: true })
  orderId!: string;

  @Prop({ type: Number, required: true, min: 0 })
  amount!: number;

  @Prop({ default: 'INR', trim: true })
  currency!: string;

  @Prop({ enum: Object.values(PAYMENT_STATUS), default: PAYMENT_STATUS.CREATED, index: true })
  status!: PaymentStatus;
}
export const OrderSchema = SchemaFactory.createForClass(Order);
OrderSchema.index({ user: 1, createdAt: -1 });
