import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ConfirmPaymentDto {
  @ApiProperty({
    description: 'ID of the payment intent to confirm',
    example: 'pi_12345',
  })
  @IsNotEmpty()
  @IsString()
  paymentIntentId: string;

  @ApiProperty({
    description: 'ID of the order associated with the payment intent',
    example: 'order_12345',
  })
  @IsNotEmpty()
  @IsString()
  orderId: string;
}
