import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info, context: ExecutionContext) {
    if (err || !user) {
      console.log('[JwtAuthGuard] 인증 실패:', err, info);
    } else {
      console.log('[JwtAuthGuard] 인증 성공:', user);
    }
    return super.handleRequest(err, user, info, context);
  }
}
