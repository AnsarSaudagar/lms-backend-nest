import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: 'learner@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '482910', description: '6-digit OTP sent to the email', minLength: 6, maxLength: 6 })
  @IsString()
  @Length(6, 6)
  otp!: string;

  @ApiProperty({ example: 'newSecret123', description: 'New password (min 6 characters)', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  newPassword!: string;
}
