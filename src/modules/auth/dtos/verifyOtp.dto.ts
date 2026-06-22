import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from "class-validator";

export class VerifyOtpDto {
  @ApiProperty({ example: 'learner@example.com', description: 'Email address the OTP was sent to' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '482910', description: '6-digit OTP sent to the email', minLength: 6, maxLength: 6 })
  @IsString()
  @Length(6, 6)
  otp!: string;
}