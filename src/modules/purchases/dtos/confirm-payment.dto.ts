import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ConfirmPaymentDto {
  @ApiProperty({
    example: 'order_9f3a1c2b4d5e6f7a8b9c',
    description: 'The orderId returned by the purchase endpoint',
  })
  @IsString()
  @IsNotEmpty()
  orderId!: string;
}
