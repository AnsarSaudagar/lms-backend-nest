import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { UserRegisterDTO } from './dtos/userRegister.dto';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  login(@Body() registerUser: UserRegisterDTO){
    return this.authService.register(registerUser);
  }
}
