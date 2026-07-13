import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ConfirmOrderDto {
  @ApiProperty({
    example: 'order_9f3a1c2b4d5e6f7a8b9c',
    description: 'The orderId returned by the cart checkout endpoint',
  })
  @IsString()
  @IsNotEmpty()
  orderId!: string;
}
