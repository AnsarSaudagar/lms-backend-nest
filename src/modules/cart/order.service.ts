import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomBytes } from 'crypto';
import { Order, OrderDocument } from './schemas/order.schema';
import { PAYMENT_STATUS } from 'src/common/constants/payment-status.constant';
import { ACCESS_TYPE } from 'src/common/constants/access-type.constant';
import { ProjectsService } from '../projects/projects.service';
import { UserProjectService } from '../purchases/user-project.service';
import { CartService } from './cart.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    private readonly projectsService: ProjectsService,
    private readonly userProjectService: UserProjectService,
    private readonly cartService: CartService,
  ) {}

  /**
   * Creates a (mock) order from the user's cart. Cart is NOT cleared here —
   * only on confirmOrder — so an abandoned checkout leaves the cart intact
   * for retry (mirrors PaymentsService.createOrder leaving Payment as CREATED).
   */
  async createOrderFromCart(userId: string) {
    const cart = await this.cartService.getRawCart(userId);
    if (cart.items.length === 0) {
      throw new BadRequestException('Your cart is empty');
    }

    const items: { project: any; price: number }[] = [];
    for (const cartItem of cart.items) {
      const projectId = cartItem.project.toString();
      const project = await this.projectsService.findOne(projectId);

      if (!project.isPaid) {
        throw new BadRequestException(
          `Project "${project.title}" is no longer paid — remove it from your cart`,
        );
      }
      if (await this.userProjectService.hasAccess(userId, projectId)) {
        throw new ConflictException(
          `You already own "${project.title}" — remove it from your cart`,
        );
      }
      items.push({ project: project._id, price: project.price });
    }

    const amount = items.reduce((sum, i) => sum + i.price, 0);
    const orderId = `order_${randomBytes(10).toString('hex')}`;

    await this.orderModel.create({
      user: userId,
      items,
      orderId,
      amount,
      currency: 'INR',
      status: PAYMENT_STATUS.CREATED,
    });

    return { orderId, amount, currency: 'INR' };
  }

  /**
   * Confirms a (mock) order: marks it paid and grants access to every item.
   * grant() is already idempotent on duplicate {user,project}; the try/catch
   * below is just a safety net so one bad item can't block the rest.
   */
  async confirmOrder(userId: string, orderId: string) {
    const order = await this.orderModel.findOne({ orderId, user: userId }).exec();
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (order.status === PAYMENT_STATUS.FAILED) {
      throw new BadRequestException('This order has failed. Please start a new checkout.');
    }

    if (order.status !== PAYMENT_STATUS.PAID) {
      // --- mock gateway verification (always succeeds) ---
      order.status = PAYMENT_STATUS.PAID;
      await order.save();
    }

    const access: { projectId: string; accessType: string }[] = [];
    for (const item of order.items) {
      try {
        const granted = await this.userProjectService.grant(
          userId,
          item.project.toString(),
          ACCESS_TYPE.PAID,
          order._id,
        );
        access.push({ projectId: granted.project.toString(), accessType: granted.accessType });
      } catch {
        // Duplicate grants are handled inside `grant`; swallow any other
        // per-item failure so it doesn't block the rest.
      }
    }

    await this.cartService.clearCart(userId);

    return {
      order: {
        orderId: order.orderId,
        status: order.status,
        amount: order.amount,
        currency: order.currency,
      },
      access,
    };
  }
}
