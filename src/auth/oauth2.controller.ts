import { Body, Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import { Response, Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { OAuth2AuthorizeQueryDto, OAuth2TokenDto } from '../dto/oauth2.dto';

/**
 * OAuth2 인증/인가 API
 */
@ApiTags('OAuth2')
@Controller('oauth2')
export class OAuth2Controller {
  /**
   * OAuth2 인증 엔드포인트
   */
  @ApiOperation({
    summary: 'OAuth2 인증',
    description: 'OAuth2 인증 코드를 발급받기 위한 엔드포인트입니다.',
  })
  @ApiQuery({
    name: 'response_type',
    description: '응답 타입',
    example: 'code',
  })
  @ApiQuery({
    name: 'client_id',
    description: '클라이언트 ID',
    example: 'client_123456',
  })
  @ApiQuery({
    name: 'redirect_uri',
    description: '리다이렉트 URI',
    example: 'https://example.com/callback',
  })
  @ApiQuery({
    name: 'scope',
    description: '요청 스코프',
    example: 'read write',
    required: false,
  })
  @ApiQuery({
    name: 'state',
    description: '상태값 (CSRF 방지)',
    example: 'random_state_string',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: '인증 화면 또는 승인 화면',
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 파라미터',
  })
  @Get('authorize')
  async authorize(
    @Query() query: OAuth2AuthorizeQueryDto,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    // TODO: 인증된 사용자라면 승인 화면, 아니면 로그인 화면으로 리다이렉트
    // 실제 구현은 OAuth2Service에서 처리
    res.json({ message: 'OAuth2 Authorize Endpoint', query });
  }

  /**
   * OAuth2 토큰 엔드포인트
   */
  @ApiOperation({
    summary: 'OAuth2 토큰 발급',
    description: '인증 코드를 사용하여 액세스 토큰을 발급받습니다.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        grant_type: {
          type: 'string',
          description: 'Grant 타입',
          example: 'authorization_code',
        },
        code: {
          type: 'string',
          description: '인증 코드',
          example: 'auth_code_123456',
        },
        redirect_uri: {
          type: 'string',
          description: '리다이렉트 URI',
          example: 'https://example.com/callback',
        },
        client_id: {
          type: 'string',
          description: '클라이언트 ID',
          example: 'client_123456',
        },
        client_secret: {
          type: 'string',
          description: '클라이언트 시크릿',
          example: 'secret_123456',
        },
      },
      required: ['grant_type', 'code', 'redirect_uri', 'client_id'],
    },
  })
  @ApiResponse({
    status: 200,
    description: '토큰 발급 성공',
    schema: {
      type: 'object',
      properties: {
        access_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        token_type: { type: 'string', example: 'Bearer' },
        expires_in: { type: 'number', example: 3600 },
        refresh_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        scope: { type: 'string', example: 'read write' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 데이터',
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
  })
  @Post('token')
  async token(
    @Body() body: OAuth2TokenDto,
    @Res() res: Response,
  ): Promise<void> {
    // TODO: grant_type, code 등 파라미터 검증 및 토큰 발급
    // 실제 구현은 OAuth2Service에서 처리
    res.json({ message: 'OAuth2 Token Endpoint', body });
  }
}
