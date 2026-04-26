import * as argon2 from 'argon2';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { User } from 'src/schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import { UserRegisterDTO } from './dtos/userRegister.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(data: UserRegisterDTO) {
    const { email, password, firstName, middleName, lastName } = data;

    const existingUser: User | null = await this.usersService.findByEmail(email);

    if (existingUser) {
      throw new BadRequestException('An account with this email already exists');
    }

    const hashedPassword = await this.hashPassword(password);

    const user = await this.usersService.createUser({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      middleName,
    });

    const { password: _, ...safeUser } = user.toObject();
    return safeUser;
  }

  async login(email: string, password: string, expectedRole: string) {
    const user: User | null = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.role !== expectedRole) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new ForbiddenException('Your account has been deactivated. Please contact support.');
    }

    const valid = await this.verifyPassword(user.password, password);

    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.issueToken(user);
  }

  private async hashPassword(password: string): Promise<string> {
    return argon2.hash(password);
  }

  private async verifyPassword(hash: string, password: string): Promise<boolean> {
    return argon2.verify(hash, password);
  }

  private async issueToken(user: User) {
    const payload = {
      sub: user._id,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);
    return { accessToken };
  }
}
