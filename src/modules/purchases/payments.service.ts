import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomBytes } from 'crypto';
import { Payment, PaymentDocument } from 'src/schemas/payment.schema';
import { PAYMENT_STATUS } from 'src/common/constants/payment-status.constant';
import { ACCESS_TYPE } from 'src/common/constants/access-type.constant';
import { UserProjectService } from './user-project.service';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
    private readonly userProjectService: UserProjectService,
  ) {}

  /**
   * Creates a (mock) payment order for a paid project.
   * A real gateway (e.g. Razorpay) would create the order here and return its id.
   */
  async createOrder(userId: string, projectId: string) {
    const project = await this.userProjectService.getProjectOrThrow(projectId);

    if (!project.isPaid) {
      throw new BadRequestException(
        'This project is free. Use the enroll endpoint instead.',
      );
    }

    if (await this.userProjectService.hasAccess(userId, projectId)) {
      throw new ConflictException('You already own this project');
    }

    const orderId = `order_${randomBytes(10).toString('hex')}`;

    await this.paymentModel.create({
      user: userId,
      project: projectId,
      orderId,
      amount: project.price,
      currency: 'INR',
      status: PAYMENT_STATUS.CREATED,
    });

    return { orderId, amount: project.price, currency: 'INR' };
  }

  /**
   * Confirms a (mock) payment: marks it paid and grants project access.
   * Idempotent — re-confirming a paid order returns the existing grant.
   * Swap the mock verification below for real gateway signature verification later.
   */
  async confirmPayment(userId: string, orderId: string) {
    const payment = await this.paymentModel
      .findOne({ orderId, user: userId })
      .exec();

    if (!payment) {
      throw new NotFoundException('Order not found');
    }

    if (payment.status === PAYMENT_STATUS.FAILED) {
      throw new BadRequestException('This order has failed. Please start a new purchase.');
    }

    if (payment.status !== PAYMENT_STATUS.PAID) {
      // --- mock gateway verification (always succeeds) ---
      payment.status = PAYMENT_STATUS.PAID;
      payment.paymentId = `pay_${randomBytes(10).toString('hex')}`;
      await payment.save();
    }

    const access = await this.userProjectService.grant(
      userId,
      payment.project.toString(),
      ACCESS_TYPE.PAID,
      payment._id,
    );

    return {
      access: {
        projectId: access.project.toString(),
        accessType: access.accessType,
      },
      payment: {
        orderId: payment.orderId,
        paymentId: payment.paymentId,
        status: payment.status,
      },
    };
  }

  async listMyPayments(userId: string): Promise<PaymentDocument[]> {
    return this.paymentModel
      .find({ user: userId })
      .sort({ createdAt: -1 })
      .exec();
  }
}
