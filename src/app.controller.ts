import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: '헬스 체크',
    description: 'API 서버 상태를 확인합니다.',
  })
  @ApiResponse({ status: 200, description: '서버가 정상적으로 동작 중입니다.' })
  getHello(): string {
    return this.appService.getHello();
  }
}
