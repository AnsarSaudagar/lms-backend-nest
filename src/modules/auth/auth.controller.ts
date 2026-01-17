import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { UserRegisterDTO } from './dtos/userRegister.dto';
import type { UserLoginDto } from './dtos/userLogin.dto';
import { ADMIN_KEY } from 'src/common/constants/user-type.constant';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  register(@Body() registerUser: UserRegisterDTO){
    return this.authService.register(registerUser);
  }

  @Post('/login-admin')
  loginAdmin(@Body() loginAdminUser: UserLoginDto){
    const { email, password } = loginAdminUser;
    return this.authService.login(email, password, ADMIN_KEY);
  }
  
}
