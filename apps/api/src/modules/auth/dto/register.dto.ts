import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@marketplace/shared';

export class RegisterDto {
  @ApiProperty({ example: 'rajesh.kumar@example.com' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'SecurePassword123!' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @ApiProperty({ example: 'Rajesh Kumar' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiPropertyOptional({ example: '+919876543210' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ enum: UserRole, default: UserRole.BUYER })
  @IsOptional()
  @IsEnum(UserRole)
  initialRole?: UserRole = UserRole.BUYER;
}

