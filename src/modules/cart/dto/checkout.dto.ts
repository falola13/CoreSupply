import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CheckoutDto {
  @ApiProperty({ required: false, description: 'Shipping address' })
  @IsOptional()
  @IsString()
  shippingAddress?: string;
}
