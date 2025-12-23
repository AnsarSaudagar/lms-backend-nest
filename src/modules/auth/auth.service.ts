import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  async login(email: string, password: string) {}

  async hashPassword(password: string): Promise<string> {
    const hash: string = await argon2.hash(password);
    return hash;
  }

  async verifyPassword(hash: string, password: string): Promise<boolean> {
    const isValid: boolean = await argon2.verify(hash, password);
    return isValid;
  }
}
