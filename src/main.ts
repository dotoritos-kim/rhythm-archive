import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger 자동 설정
  const config = new DocumentBuilder()
    .setTitle('Rhythm Archive API')
    .setDescription('리듬게임 아카이브 API 문서')
    .setVersion('1.0.0')
    .addServer('http://localhost:3000', '개발 서버')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'JWT 토큰을 입력하세요.',
        in: 'header',
      },
      'access-token', // This name here is important for matching up with @ApiBearerAuth() in your controller!
    )
    .addTag('health', '헬스 체크')
    .addTag('인증', '사용자 인증 관련 API')
    .addTag('OAuth2', 'OAuth2 인증/인가 관련 API')
    .addTag('CMS - 카테고리', 'CMS 카테고리 관리 API')
    .addTag('CMS - 게시글', 'CMS 게시글 관리 API')
    .addTag('CMS - 태그', 'CMS 태그 관리 API')
    .addTag('CMS - 첨부파일', 'CMS 첨부파일 관리 API')
    .addTag('songs', '곡 관련 API')
    .addTag('charts', '채보 관련 API')
    .addTag('courses', '코스 관련 API')
    .addTag('games', '게임 관련 API')
    .addTag('tags', '태그 관련 API')
    .addTag('게임 데이터', '게임 데이터 관련 API')
    .addTag('검색', '검색 관련 API')
    .addTag('즐겨찾기', '즐겨찾기 관련 API')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // http://localhost:3000/api

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
