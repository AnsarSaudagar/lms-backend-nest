import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { CartService } from './cart.service';
import { OrderService } from './order.service';
import { AddToCartDto } from './dtos/add-to-cart.dto';
import { ConfirmOrderDto } from './dtos/confirm-order.dto';

@ApiTags('Cart')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller()
export class CartController {
  constructor(
    private readonly cartService: CartService,
    private readonly orderService: OrderService,
  ) {}

  @Post('cart/items')
  @ApiOperation({ summary: 'Add a paid project to the cart' })
  @ApiResponse({ status: 201, description: 'Item added. Returns the updated cart.' })
  addItem(@CurrentUser('userId') userId: string, @Body() dto: AddToCartDto) {
    return this.cartService.addItem(userId, dto.projectId);
  }

  @Get('cart')
  @ApiOperation({ summary: 'View the current cart' })
  getCart(@CurrentUser('userId') userId: string) {
    return this.cartService.getCart(userId);
  }

  @Delete('cart/items/:projectId')
  @ApiOperation({ summary: 'Remove one item from the cart' })
  @ApiParam({ name: 'projectId', description: 'MongoDB ObjectId of the project' })
  removeItem(@CurrentUser('userId') userId: string, @Param('projectId') projectId: string) {
    return this.cartService.removeItem(userId, projectId);
  }

  @Delete('cart')
  @ApiOperation({ summary: 'Clear the entire cart' })
  clearCart(@CurrentUser('userId') userId: string) {
    return this.cartService.clearCart(userId);
  }

  @Post('cart/checkout')
  @ApiOperation({ summary: 'Create an order from the current cart' })
  @ApiResponse({ status: 201, description: 'Order created. Returns { orderId, amount, currency }.' })
  checkout(@CurrentUser('userId') userId: string) {
    return this.orderService.createOrderFromCart(userId);
  }

  @Post('orders/confirm')
  @ApiOperation({ summary: 'Confirm an order and unlock all its projects' })
  confirmOrder(@CurrentUser('userId') userId: string, @Body() dto: ConfirmOrderDto) {
    return this.orderService.confirmOrder(userId, dto.orderId);
  }
}
