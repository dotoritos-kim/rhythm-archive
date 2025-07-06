import {
  IsEmail,
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: '사용자 이메일',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: '사용자 비밀번호',
    example: 'password123',
  })
  @IsString()
  password: string;
}

export class RegisterDto {
  @ApiProperty({
    description: '사용자 이메일',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: '사용자 비밀번호',
    example: 'password123',
  })
  @IsString()
  password: string;

  @ApiProperty({
    description: '사용자 이름',
    example: '홍길동',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;
}

export class UserInfoDto {
  @ApiProperty({
    description: '사용자 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: '사용자 이메일',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: '사용자 이름',
    example: '홍길동',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: '계정 활성화 상태',
    example: true,
  })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({
    description: '이메일 인증 상태',
    example: true,
  })
  @IsBoolean()
  emailVerified: boolean;

  @ApiProperty({
    description: '역할 ID',
    example: 'role-123',
    required: false,
  })
  @IsString()
  @IsOptional()
  roleId?: string;

  @ApiProperty({
    description: '역할 이름',
    example: 'admin',
    required: false,
  })
  @IsString()
  @IsOptional()
  role?: string;
}

export class UserProfileDto {
  @ApiProperty({
    description: '사용자 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: '사용자 이메일',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: '사용자 이름',
    example: '홍길동',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: '이름',
    example: '길동',
    required: false,
  })
  @IsString()
  @IsOptional()
  givenName?: string;

  @ApiProperty({
    description: '성',
    example: '홍',
    required: false,
  })
  @IsString()
  @IsOptional()
  familyName?: string;

  @ApiProperty({
    description: '닉네임',
    example: 'hong123',
    required: false,
  })
  @IsString()
  @IsOptional()
  nickname?: string;

  @ApiProperty({
    description: '프로필 이미지 URL',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  picture?: string;

  @ApiProperty({
    description: '웹사이트',
    example: 'https://example.com',
    required: false,
  })
  @IsString()
  @IsOptional()
  website?: string;

  @ApiProperty({
    description: '성별',
    example: 'male',
    required: false,
  })
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiProperty({
    description: '전화번호',
    example: '010-1234-5678',
    required: false,
  })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({
    description: '주소',
    example: '서울시 강남구',
    required: false,
  })
  @IsString()
  @IsOptional()
  address?: string;
}

export class UpdateUserProfileDto {
  @ApiProperty({
    description: '사용자 이름',
    example: '홍길동',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: '이름',
    example: '길동',
    required: false,
  })
  @IsString()
  @IsOptional()
  givenName?: string;

  @ApiProperty({
    description: '성',
    example: '홍',
    required: false,
  })
  @IsString()
  @IsOptional()
  familyName?: string;

  @ApiProperty({
    description: '닉네임',
    example: 'hong123',
    required: false,
  })
  @IsString()
  @IsOptional()
  nickname?: string;

  @ApiProperty({
    description: '프로필 이미지 URL',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  picture?: string;

  @ApiProperty({
    description: '웹사이트',
    example: 'https://example.com',
    required: false,
  })
  @IsString()
  @IsOptional()
  website?: string;

  @ApiProperty({
    description: '성별',
    example: 'male',
    required: false,
  })
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiProperty({
    description: '전화번호',
    example: '010-1234-5678',
    required: false,
  })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({
    description: '주소',
    example: '서울시 강남구',
    required: false,
  })
  @IsString()
  @IsOptional()
  address?: string;
}

export class ChangePasswordDto {
  @ApiProperty({
    description: '현재 비밀번호',
    example: 'currentPassword123',
  })
  @IsString()
  currentPassword: string;

  @ApiProperty({
    description: '새 비밀번호',
    example: 'newPassword123',
  })
  @IsString()
  newPassword: string;
}

export class OAuth2ClientDto {
  @ApiProperty({
    description: '클라이언트 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: '클라이언트 이름',
    example: 'My App',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'OAuth2 클라이언트 ID',
    example: 'client_123456',
  })
  @IsString()
  clientId: string;

  @ApiProperty({
    description: 'OAuth2 클라이언트 시크릿',
    example: 'secret_123456',
    required: false,
  })
  @IsString()
  @IsOptional()
  clientSecret?: string;

  @ApiProperty({
    description: '리다이렉트 URI 목록',
    example: ['https://example.com/callback'],
  })
  @IsArray()
  @IsString({ each: true })
  redirectUris: string[];

  @ApiProperty({
    description: '허용된 grant 타입',
    example: ['authorization_code', 'refresh_token'],
  })
  @IsArray()
  @IsString({ each: true })
  grantTypes: string[];

  @ApiProperty({
    description: '응답 타입',
    example: ['code'],
  })
  @IsArray()
  @IsString({ each: true })
  responseTypes: string[];

  @ApiProperty({
    description: '스코프 목록',
    example: ['read', 'write'],
  })
  @IsArray()
  @IsString({ each: true })
  scopes: string[];

  @ApiProperty({
    description: '로고 URL',
    example: 'https://example.com/logo.png',
    required: false,
  })
  @IsString()
  @IsOptional()
  logoUrl?: string;

  @ApiProperty({
    description: '클라이언트 URI',
    example: 'https://example.com',
    required: false,
  })
  @IsString()
  @IsOptional()
  clientUri?: string;

  @ApiProperty({
    description: '기밀 클라이언트 여부',
    example: true,
  })
  @IsBoolean()
  isConfidential: boolean;

  @ApiProperty({
    description: '1st party 앱 여부',
    example: false,
  })
  @IsBoolean()
  isFirstParty: boolean;

  @ApiProperty({
    description: '활성화 상태',
    example: true,
  })
  @IsBoolean()
  isActive: boolean;
}

export class CreateOAuth2ClientDto {
  @ApiProperty({
    description: '클라이언트 이름',
    example: 'My App',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: '리다이렉트 URI 목록',
    example: ['https://example.com/callback'],
  })
  @IsArray()
  @IsString({ each: true })
  redirectUris: string[];

  @ApiProperty({
    description: '허용된 grant 타입',
    example: ['authorization_code', 'refresh_token'],
  })
  @IsArray()
  @IsString({ each: true })
  grantTypes: string[];

  @ApiProperty({
    description: '응답 타입',
    example: ['code'],
  })
  @IsArray()
  @IsString({ each: true })
  responseTypes: string[];

  @ApiProperty({
    description: '스코프 목록',
    example: ['read', 'write'],
  })
  @IsArray()
  @IsString({ each: true })
  scopes: string[];

  @ApiProperty({
    description: '로고 URL',
    example: 'https://example.com/logo.png',
    required: false,
  })
  @IsString()
  @IsOptional()
  logoUrl?: string;

  @ApiProperty({
    description: '클라이언트 URI',
    example: 'https://example.com',
    required: false,
  })
  @IsString()
  @IsOptional()
  clientUri?: string;

  @ApiProperty({
    description: '기밀 클라이언트 여부',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isConfidential?: boolean;

  @ApiProperty({
    description: '1st party 앱 여부',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isFirstParty?: boolean;
}
