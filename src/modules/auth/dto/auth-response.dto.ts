import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

// DTO for auth response
export class AuthResponseDto {
  @ApiProperty({
    description: 'Access token for authentication',
    example: 'eyJhG',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Refresh token for authentication',
    example: 'eyJhG',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'Authenticated user information',
    example: {
      id: 'user-123',
      email: '<EMAIL>',
      firstName: 'John',
      lastName: 'Doe',
      role: 'USER',
    },
  })
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: Role;
  };
}
