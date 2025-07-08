import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class OAuth2AuthorizeQueryDto {
  @ApiProperty({
    description: '응답 타입',
    example: 'code',
  })
  @IsString()
  response_type: string;

  @ApiProperty({
    description: '클라이언트 ID',
    example: 'client_123456',
  })
  @IsString()
  client_id: string;

  @ApiProperty({
    description: '리다이렉트 URI',
    example: 'https://example.com/callback',
  })
  @IsString()
  redirect_uri: string;

  @ApiProperty({
    description: '요청 스코프',
    example: 'read write',
    required: false,
  })
  @IsOptional()
  @IsString()
  scope?: string;

  @ApiProperty({
    description: '상태값 (CSRF 방지)',
    example: 'random_state_string',
    required: false,
  })
  @IsOptional()
  @IsString()
  state?: string;
}

export class OAuth2TokenDto {
  @ApiProperty({
    description: 'Grant 타입',
    example: 'authorization_code',
  })
  @IsString()
  grant_type: string;

  @ApiProperty({
    description: '인증 코드',
    example: 'auth_code_123456',
  })
  @IsString()
  code: string;

  @ApiProperty({
    description: '리다이렉트 URI',
    example: 'https://example.com/callback',
  })
  @IsString()
  redirect_uri: string;

  @ApiProperty({
    description: '클라이언트 ID',
    example: 'client_123456',
  })
  @IsString()
  client_id: string;

  @ApiProperty({
    description: '클라이언트 시크릿',
    example: 'secret_123456',
    required: false,
  })
  @IsOptional()
  @IsString()
  client_secret?: string;
}
