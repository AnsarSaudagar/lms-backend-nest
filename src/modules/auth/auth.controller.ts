import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { UserRegisterDTO } from './dtos/userRegister.dto';
import { UserLoginDto } from './dtos/userLogin.dto';
import { ADMIN_KEY, LEARNER_KEY } from 'src/common/constants/user-type.constant';
import { VerifyOtpDto } from './dtos/verifyOtp.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  @ApiOperation({ summary: 'Register a new learner account' })
  @ApiResponse({ status: 201, description: 'Account created. Returns the new user object (password excluded).' })
  @ApiResponse({ status: 400, description: 'Email already in use or validation failed.' })
  register(@Body() dto: UserRegisterDTO) {
    return this.authService.register(dto);
  }

  @Post('/login')
  @ApiOperation({ summary: 'Learner login' })
  @ApiResponse({ status: 200, description: 'Returns a JWT access token.' })
  @ApiResponse({ status: 401, description: 'Invalid email or password.' })
  @ApiResponse({ status: 403, description: 'Account is deactivated.' })
  loginLearner(@Body() dto: UserLoginDto) {
    return this.authService.login(dto.email, dto.password, LEARNER_KEY);
  }

  @Post('/login-admin')
  @ApiOperation({ summary: 'Admin login' })
  @ApiResponse({ status: 200, description: 'Returns a JWT access token.' })
  @ApiResponse({ status: 401, description: 'Invalid email or password.' })
  @ApiResponse({ status: 403, description: 'Account is deactivated.' })
  loginAdmin(@Body() dto: UserLoginDto) {
    return this.authService.login(dto.email, dto.password, ADMIN_KEY);
  }

  @Post('/verify-otp')
  @ApiOperation({ summary: 'Verify email OTP' })
  @ApiResponse({ status: 200, description: 'OTP verified successfully.' })
  @ApiResponse({ status: 400, description: 'OTP expired or invalid.' })
  verifyOtp(@Body() dto: VerifyOtpDto){
    return this.authService.verifyOtp(dto.email, dto.otp);
  }
}
