import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCartDto {
  @ApiProperty({
    example: 2,
  })
  @IsNumber()
  @Type(() => Number)
  quantity: number;

  @ApiProperty({
    example: 'product-124',
  })
  @IsString()
  @IsNotEmpty()
  productId: string;
}
