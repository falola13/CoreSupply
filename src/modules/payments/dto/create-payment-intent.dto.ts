import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePaymentIntentDto {
  @ApiProperty({
    description:
      'ID of the order for which the payment intent is being created',
    example: 'order_12345',
  })
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @ApiProperty({
    description: 'Amount to be paid for the order',
    example: 100.0,
  })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty({
    description: 'Currency of the payment',
    example: 'usd',
  })
  @IsOptional()
  @IsString()
  currency?: string = 'usd';

  @ApiProperty({
    description: 'Description of the payment',
    example: 'Payment for order #12345',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
