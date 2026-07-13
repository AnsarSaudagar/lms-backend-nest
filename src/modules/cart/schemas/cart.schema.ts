import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from 'src/modules/users/schemas/user.schema';
import { Project } from 'src/modules/projects/schemas/project.schema';

export type CartDocument = HydratedDocument<Cart>;

@Schema({ _id: false })
export class CartItem {
  @Prop({ type: Types.ObjectId, ref: Project.name, required: true })
  project!: Types.ObjectId;

  @Prop({ default: () => new Date() })
  addedAt!: Date;
}
export const CartItemSchema = SchemaFactory.createForClass(CartItem);

@Schema({ timestamps: true, versionKey: false })
export class Cart {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, unique: true, index: true })
  user!: Types.ObjectId;

  @Prop({ type: [CartItemSchema], default: [] })
  items!: CartItem[];
}
export const CartSchema = SchemaFactory.createForClass(Cart);
