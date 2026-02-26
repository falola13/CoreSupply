import { ApiProperty } from '@nestjs/swagger';

export class ProductResponseDto {
  @ApiProperty({
    description: 'Product ID',
    example: '4532434b-23b2j3j2-32njfdj',
  })
  id: string;

  @ApiProperty({
    description: 'Product name',
    example: '4K TV',
  })
  name: string;

  @ApiProperty({
    description: 'Product description',
    example: 'A clean 4K TV set',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    description: 'Product Price',
    example: 99.99,
  })
  price: number;

  @ApiProperty({
    description: 'Product Stock',
    example: 100,
  })
  stock: number;

  @ApiProperty({
    description: 'Product Stock keeping Unit',
    example: 'WH-001',
  })
  sku: string;

  @ApiProperty({
    description: 'Product Image Url',
    example: 'https://www.example.com/image.jpg',
    nullable: true,
  })
  imageUrl: string | null;

  @ApiProperty({
    description: 'Product category',
    example: 'Electronics',
    nullable: true,
  })
  category: string | null;

  @ApiProperty({
    description: 'Product availability status',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Creation timestamp of product',
    example: '2026-01-02T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'update timestamp of product',
    example: '2026-01-02T00:00:00.000Z',
  })
  updatedAt: Date;
}
