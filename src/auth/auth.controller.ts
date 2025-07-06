import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  LoginDto,
  RegisterDto,
  ChangePasswordDto,
  UpdateUserProfileDto,
  UserProfileDto,
  UserInfoDto,
} from '../dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

/**
 * 인증 관련 API
 */
@ApiTags('인증')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 사용자 회원가입
   */
  @ApiOperation({
    summary: '사용자 회원가입',
    description: '새로운 사용자를 등록합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '회원가입 성공',
    type: UserInfoDto,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 데이터',
  })
  @ApiResponse({
    status: 409,
    description: '이미 존재하는 이메일',
  })
  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<UserInfoDto> {
    return this.authService.register(dto);
  }

  /**
   * 사용자 로그인
   */
  @ApiOperation({
    summary: '사용자 로그인',
    description: '이메일과 비밀번호로 로그인합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '로그인 성공',
    schema: {
      type: 'object',
      properties: {
        accessToken: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        refreshToken: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        user: { $ref: '#/components/schemas/UserInfoDto' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
  })
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /**
   * 토큰 갱신
   */
  @ApiOperation({
    summary: '토큰 갱신',
    description: '리프레시 토큰을 사용하여 새로운 액세스 토큰을 발급받습니다.',
  })
  @ApiResponse({
    status: 200,
    description: '토큰 갱신 성공',
    schema: {
      type: 'object',
      properties: {
        accessToken: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        refreshToken: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '유효하지 않은 리프레시 토큰',
  })
  @Post('refresh')
  async refresh(@Body() body: { refreshToken: string }) {
    return this.authService.refreshToken(body.refreshToken);
  }

  /**
   * 로그아웃
   */
  @ApiOperation({
    summary: '로그아웃',
    description: '현재 사용자를 로그아웃시킵니다.',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: '로그아웃 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '인증되지 않은 요청',
  })
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req) {
    const token = req.headers['authorization']?.replace('Bearer ', '');
    await this.authService.logout(token);
    return { success: true };
  }

  /**
   * 내 프로필 조회
   */
  @ApiOperation({
    summary: '내 프로필 조회',
    description: '현재 로그인한 사용자의 프로필 정보를 조회합니다.',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: '프로필 조회 성공',
    type: UserProfileDto,
  })
  @ApiResponse({
    status: 401,
    description: '인증되지 않은 요청',
  })
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() req): Promise<UserProfileDto> {
    return this.authService.getUserProfile(req.user.sub);
  }

  /**
   * 내 프로필 수정
   */
  @ApiOperation({
    summary: '내 프로필 수정',
    description: '현재 로그인한 사용자의 프로필 정보를 수정합니다.',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: '프로필 수정 성공',
    type: UserProfileDto,
  })
  @ApiResponse({
    status: 401,
    description: '인증되지 않은 요청',
  })
  @Post('me')
  @UseGuards(JwtAuthGuard)
  async updateMe(
    @Req() req,
    @Body() dto: UpdateUserProfileDto,
  ): Promise<UserProfileDto> {
    return this.authService.updateUserProfile(req.user.sub, dto);
  }

  /**
   * 비밀번호 변경
   */
  @ApiOperation({
    summary: '비밀번호 변경',
    description: '현재 로그인한 사용자의 비밀번호를 변경합니다.',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: '비밀번호 변경 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 현재 비밀번호',
  })
  @ApiResponse({
    status: 401,
    description: '인증되지 않은 요청',
  })
  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(@Req() req, @Body() dto: ChangePasswordDto) {
    await this.authService.changePassword(req.user.sub, dto);
    return { success: true };
  }
}
