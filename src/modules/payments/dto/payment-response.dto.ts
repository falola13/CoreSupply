import { ApiProperty } from '@nestjs/swagger';

export class PaymentResponseDto {
  @ApiProperty({
    example: 'pi_1N2Xo2Lh4qYz5g6s7t8u9v0w',
  })
  id: string;

  @ApiProperty({
    example: 'order_1234567890',
  })
  orderId: string;

  @ApiProperty({
    example: 2000,
  })
  amount: number;

  @ApiProperty({
    example: 'user-123',
  })
  userId: string;
  @ApiProperty({
    example: 'usd',
  })
  currency: string;

  @ApiProperty({
    example: 'COMPLETED',
    enum: ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'],
  })
  status: string;

  @ApiProperty({
    example: 'STRIPE',
    nullable: true,
  })
  paymentMethod: string | null;

  @ApiProperty({
    example: 'txn_1N2Xo2Lh4qYz5g6s7t8u9v0w',
    nullable: true,
  })
  transactionId: string | null;

  @ApiProperty({
    example: new Date('2023-01-01T00:00:00.000Z'),
  })
  createdAt: Date;
  @ApiProperty({
    example: new Date('2023-01-01T00:00:00.000Z'),
  })
  updatedAt: Date;
}

export class CreatePaymentIntentResponse {
  @ApiProperty({
    example: 'pi_1N2Xo2Lh4qYz5g6s7t8u9v0w_secret_123',
    description: 'Stripe client secret for payment confirmation',
  })
  clientSecret: string;

  @ApiProperty({
    example: 'pi_1N2Xo2Lh4qYz5g6s7t8u9v0w',
    description: 'Payment ID in database',
  })
  paymentId: string;

  @ApiProperty({
    example: 'Payment intent created successfully',
    required: false,
  })
  message?: string;
}

export class PaymentApiResponseDto {
  @ApiProperty({
    example: true,
  })
  success: boolean;

  @ApiProperty({
    type: PaymentResponseDto,
  })
  data: PaymentResponseDto;

  @ApiProperty({
    example: 'Payment processed successfully',
    required: false,
  })
  message?: string;
}
export class CreatePaymentIntentApiResponseDto {
  @ApiProperty({
    example: true,
  })
  success: boolean;
  @ApiProperty({
    type: CreatePaymentIntentResponse,
  })
  data: CreatePaymentIntentResponse;

  @ApiProperty({
    example: 'Payment intent created successfully',
    required: false,
  })
  message?: string;
}
