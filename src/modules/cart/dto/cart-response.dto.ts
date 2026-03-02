import { ApiProperty } from '@nestjs/swagger';

export class cartItemsDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  productId: string;

  @ApiProperty()
  stock: number; // Added since you use it in your mapper

  @ApiProperty({ required: false, nullable: true })
  imageUrl: string | null;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
export class CartResponseDto {
  @ApiProperty({
    description: 'Cart ID',
    example: '4532434b-23b2j3j2-32njfdj',
  })
  id: string;

  @ApiProperty()
  userId: string | null;

  @ApiProperty()
  item: cartItemsDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
export class CartApiResponseDto<T> {
  @ApiProperty({
    example: true,
  })
  success: boolean;

  @ApiProperty({ type: CartResponseDto })
  data: T;
  @ApiProperty({
    example: 'Cart created successfully',
  })
  message: string;
}
