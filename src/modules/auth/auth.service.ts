import * as argon2 from 'argon2';
import {
  BadRequestException,
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

    const existingUser: User | null =
      await this.usersService.findByEmail(email);

    // Checking if user already exist
    if (existingUser) {
      throw new BadRequestException('Email is already used');
    }

    // Hashing password for security
    const hashedPassword = await this.hashPassword(password);

    // Creating new user
    const user = await this.usersService.createUser({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      middleName,
    });

    // Removing password
    const { password: _, ...safeUser } = user.toObject();

    return safeUser;
  }

  async login(email: string, password: string, userRole: String ) {
    const user: User | null = await this.usersService.findByEmail(email);
    console.log(user);
    
    if (!user) {
      throw new UnauthorizedException();
    }

    if(user.role !== userRole){
      throw new UnauthorizedException();
    }

    const valid = await this.verifyPassword(user.password, password);

    if (!valid) throw new UnauthorizedException();

    return this.issuesToken(user);
  }

  private async hashPassword(password: string): Promise<string> {
    const hash: string = await argon2.hash(password);
    return hash;
  }

  private async verifyPassword(hash: string, password: string): Promise<boolean> {
    const isValid: boolean = await argon2.verify(hash, password);
    return isValid;
  }

  private async issuesToken(user: User) {
    const payload = {
      sub: user._id,
    };
    const accessToken = await this.jwtService.signAsync(payload);

    return { accessToken };
  }
}
