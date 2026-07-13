import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Cart, CartSchema } from './schemas/cart.schema';
import { Order, OrderSchema } from './schemas/order.schema';
import { CartService } from './cart.service';
import { OrderService } from './order.service';
import { CartController } from './cart.controller';
import { ProjectsModule } from '../projects/projects.module';
import { PurchasesModule } from '../purchases/purchases.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Cart.name, schema: CartSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
    ProjectsModule,
    PurchasesModule,
  ],
  controllers: [CartController],
  providers: [CartService, OrderService],
  exports: [CartService, OrderService],
})
export class CartModule {}
