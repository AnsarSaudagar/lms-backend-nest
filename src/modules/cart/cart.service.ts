import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';
import { ProjectsService } from '../projects/projects.service';
import { UserProjectService } from '../purchases/user-project.service';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private readonly cartModel: Model<CartDocument>,
    private readonly projectsService: ProjectsService,
    private readonly userProjectService: UserProjectService,
  ) {}

  private async getOrCreateCart(userId: string): Promise<CartDocument> {
    let cart = await this.cartModel.findOne({ user: userId }).exec();
    if (!cart) {
      cart = await this.cartModel.create({ user: userId, items: [] });
    }
    return cart;
  }

  async addItem(userId: string, projectId: string) {
    const project = await this.projectsService.findOne(projectId);

    if (!project.isPaid) {
      throw new BadRequestException('This project is free. Use the enroll endpoint instead.');
    }
    if (await this.userProjectService.hasAccess(userId, projectId)) {
      throw new ConflictException('You already own this project');
    }

    const cart = await this.getOrCreateCart(userId);
    if (cart.items.some((i) => i.project.toString() === projectId)) {
      throw new ConflictException('This project is already in your cart');
    }

    cart.items.push({ project: project._id, addedAt: new Date() } as any);
    await cart.save();
    return this.getCart(userId);
  }

  async getCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);
    
    await cart.populate('items.project', 'slug title price isPaid');
    
     const items = cart.items.map((item: any) => ({
        ...(item.project?.toObject?.() ?? item.project),
        addedAt: item.addedAt,
      }));

    const total = cart.items.reduce((sum, i: any) => sum + (i.project?.price ?? 0), 0);
    return { items , total, currency: 'INR' };
  }

  async removeItem(userId: string, projectId: string) {
    const cart = await this.getOrCreateCart(userId);
    cart.items = cart.items.filter((i) => i.project.toString() !== projectId) as any;
    await cart.save();
    return this.getCart(userId);
  }

  async clearCart(userId: string) {
    await this.cartModel.updateOne({ user: userId }, { $set: { items: [] } }).exec();
  }

  /** Internal — raw (unpopulated) cart doc, used by OrderService. */
  async getRawCart(userId: string): Promise<CartDocument> {
    return this.getOrCreateCart(userId);
  }
}
