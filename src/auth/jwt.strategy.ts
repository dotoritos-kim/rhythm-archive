import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'dev-secret',
    });
  }

  async validate(payload: any) {
    console.log('[JWT] payload:', payload);
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { role: true },
    });

    if (!user || !user.isActive) {
      console.log('[JWT] 인증 실패: 유효하지 않은 사용자');
      throw new UnauthorizedException('유효하지 않은 사용자입니다.');
    }

    console.log('[JWT] 인증 성공:', user.id);
    return {
      sub: user.id,
      email: user.email,
      role: user.role?.name,
    };
  }
}
