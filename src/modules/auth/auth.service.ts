import * as argon2 from 'argon2';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { User } from 'src/schemas/user.schema';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user: User | null = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException();
    }

    const valid = await this.verifyPassword(user.password, password);

    if (!valid) throw new UnauthorizedException();

    return this.issuesToken(user);
  }

  async hashPassword(password: string): Promise<string> {
    const hash: string = await argon2.hash(password);
    return hash;
  }

  async verifyPassword(hash: string, password: string): Promise<boolean> {
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
