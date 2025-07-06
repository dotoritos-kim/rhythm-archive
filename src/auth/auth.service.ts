import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import {
  LoginDto,
  RegisterDto,
  UserInfoDto,
  UserProfileDto,
  UpdateUserProfileDto,
  ChangePasswordDto,
} from '../dto/auth.dto';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<UserInfoDto> {
    const { email, password, name } = registerDto;

    // 이메일 중복 확인
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('이미 존재하는 이메일입니다.');
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(password, 12);

    // 사용자 생성
    const user = await this.prisma.user.create({
      data: {
        id: uuidv4().replace(/-/g, ''),
        email,
        password: hashedPassword,
        name,
        isActive: true,
        emailVerified: false,
      },
    });

    return this.mapToUserInfoDto(user);
  }

  async login(
    loginDto: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string; user: UserInfoDto }> {
    const { email, password, username, name } = loginDto as any;

    // email 또는 name(username)으로 사용자 찾기
    let user: any = null;
    if (email) {
      user = await this.prisma.user.findUnique({
        where: { email },
        include: { role: true },
      });
    } else if (username || name) {
      user = await this.prisma.user.findFirst({
        where: { name: username || name },
        include: { role: true },
      });
    }

    if (!user || !user.isActive || !user.password) {
      throw new UnauthorizedException(
        '이메일/이름 또는 비밀번호가 올바르지 않습니다.',
      );
    }

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException(
        '이메일/이름 또는 비밀번호가 올바르지 않습니다.',
      );
    }

    // JWT 토큰 생성
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role?.name,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '1h',
      secret: process.env.JWT_SECRET || 'dev-secret',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
      secret: process.env.JWT_SECRET || 'dev-secret',
    });

    // JWT에서 exp 추출
    const decoded: any = this.jwtService.decode(refreshToken);
    const expiresAt = new Date(decoded.exp * 1000);

    // 기본 클라이언트 찾기
    const defaultClient = await this.prisma.client.findUnique({
      where: { clientId: 'default' },
    });

    if (!defaultClient) {
      throw new Error('Default client not found');
    }

    // 기존 리프레시 토큰 삭제 (중복 방지)
    await this.prisma.refreshToken.deleteMany({
      where: { userId: user.id, clientId: defaultClient.clientId },
    });

    // 리프레시 토큰 저장
    await this.prisma.refreshToken.create({
      data: {
        id: uuidv4().replace(/-/g, ''),
        token: refreshToken,
        clientId: defaultClient.clientId,
        userId: user.id,
        scopes: 'read write',
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      user: this.mapToUserInfoDto(user),
    };
  }

  async refreshToken(
    token: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    let payload: any;
    try {
      try {
        payload = this.jwtService.verify(token, {
          secret: process.env.JWT_SECRET || 'dev-secret',
        });
      } catch (error) {
        console.log('[진단] verify error:', error);
        throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');
      }
      console.log('[진단] refreshToken payload:', payload);
      // 리프레시 토큰 확인
      const refreshTokenRecord = await this.prisma.refreshToken.findFirst({
        where: {
          token,
          isRevoked: false,
          expiresAt: {
            gt: new Date(),
          },
        },
      });
      if (!refreshTokenRecord) {
        console.log('[진단] refreshTokenRecord 없음');
        throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');
      }
      console.log('[진단] refreshToken DB 조회:', refreshTokenRecord);

      // 새로운 토큰 생성 (다른 페이로드로 생성하여 중복 방지)
      const newPayload = {
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
        iat: Math.floor(Date.now() / 1000), // 현재 시간 추가
      };

      const newAccessToken = this.jwtService.sign(newPayload, {
        expiresIn: '1h',
        secret: process.env.JWT_SECRET || 'dev-secret',
      });

      const newRefreshToken = this.jwtService.sign(newPayload, {
        expiresIn: '7d',
        secret: process.env.JWT_SECRET || 'dev-secret',
      });

      // 기존 리프레시 토큰 폐기(완전 삭제)
      await this.prisma.refreshToken.deleteMany({
        where: { token },
      });

      // 새로운 리프레시 토큰 저장
      const newDecoded: any = this.jwtService.decode(newRefreshToken);
      const newExpiresAt = new Date(newDecoded.exp * 1000);
      await this.prisma.refreshToken.create({
        data: {
          id: uuidv4().replace(/-/g, ''),
          token: newRefreshToken,
          clientId: refreshTokenRecord.clientId,
          userId: refreshTokenRecord.userId,
          scopes: refreshTokenRecord.scopes,
          expiresAt: newExpiresAt,
        },
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      console.log('[진단] refreshToken error:', error);
      throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');
    }
  }

  async logout(token: string): Promise<void> {
    // 리프레시 토큰 폐기
    await this.prisma.refreshToken.updateMany({
      where: { token },
      data: { isRevoked: true },
    });
  }

  async getUserProfile(userId: string): Promise<UserProfileDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userInfo: true,
      },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name || undefined,
      givenName: user.userInfo?.givenName || undefined,
      familyName: user.userInfo?.familyName || undefined,
      nickname: user.userInfo?.nickname || undefined,
      picture: user.userInfo?.picture || undefined,
      website: user.userInfo?.website || undefined,
      gender: user.userInfo?.gender || undefined,
      phoneNumber: user.userInfo?.phoneNumber || undefined,
      address: user.userInfo?.address || undefined,
    };
  }

  async updateUserProfile(
    userId: string,
    updateDto: UpdateUserProfileDto,
  ): Promise<UserProfileDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userInfo: true,
      },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    // 사용자 정보 업데이트
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: updateDto.name,
      },
    });

    // UserInfo 업데이트 또는 생성
    if (user.userInfo) {
      await this.prisma.userInfo.update({
        where: { id: user.userInfo.id },
        data: {
          givenName: updateDto.givenName,
          familyName: updateDto.familyName,
          nickname: updateDto.nickname,
          picture: updateDto.picture,
          website: updateDto.website,
          gender: updateDto.gender,
          phoneNumber: updateDto.phoneNumber,
          address: updateDto.address,
        },
      });
    } else {
      await this.prisma.userInfo.create({
        data: {
          id: uuidv4().replace(/-/g, ''),
          userId,
          givenName: updateDto.givenName,
          familyName: updateDto.familyName,
          nickname: updateDto.nickname,
          picture: updateDto.picture,
          website: updateDto.website,
          gender: updateDto.gender,
          phoneNumber: updateDto.phoneNumber,
          address: updateDto.address,
        },
      });
    }

    return this.getUserProfile(userId);
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const { currentPassword, newPassword } = changePasswordDto;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.password) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    // 현재 비밀번호 확인
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('현재 비밀번호가 올바르지 않습니다.');
    }

    // 새 비밀번호 해시화
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // 비밀번호 업데이트
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedNewPassword,
      },
    });
  }

  async validateUser(userId: string): Promise<UserInfoDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('유효하지 않은 사용자입니다.');
    }

    return this.mapToUserInfoDto(user);
  }

  private mapToUserInfoDto(user: any): UserInfoDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      role: user.role?.name,
    };
  }
}
