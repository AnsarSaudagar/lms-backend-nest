import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'learner@example.com', description: 'Registered email address' })
  @IsEmail()
  email!: string;
}
