import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/modules/users/schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  async createUser(userData: Partial<User>){
    const user = new this.userModel(userData);
    return await user.save();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async updatePassword(email: string, hashedPassword: string): Promise<void> {
    await this.userModel.updateOne({ email }, { $set: { password: hashedPassword } }).exec();
  }
}
