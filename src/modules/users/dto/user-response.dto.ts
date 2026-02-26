// DTO

import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class UserResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: '123e4556-e898b-12d4-a812-1234567890ab',
  })
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'User First Name',
    example: 'John',
    nullable: true,
  })
  firstName: string | null;

  @ApiProperty({
    description: 'User Last Name',
    example: 'John',
    nullable: true,
  })
  lastName: string | null;

  @ApiProperty({
    description: 'User role',
    enum: Role,
  })
  role: Role;

  @ApiProperty({
    description: 'Account creation date',
    example: '2026-10-01T12:34:56.789Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last account update date',
    example: '2026-10-01T12:34:56.789Z',
  })
  updatedAt: Date;
}
