import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/auth/register (POST)', () => {
    it('should register a new user', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `test${Date.now()}@example.com`,
          password: 'password123',
          name: 'Test User',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('email');
          expect(res.body).toHaveProperty('name', 'Test User');
          expect(res.body).toHaveProperty('isActive', true);
          expect(res.body).toHaveProperty('emailVerified', false);
        });
    });

    it('should fail with duplicate email', async () => {
      const email = `duplicate${Date.now()}@example.com`;
      // 먼저 사용자 등록
      await request(app.getHttpServer()).post('/auth/register').send({
        email,
        password: 'password123',
        name: 'First User',
      });

      // 중복 이메일로 다시 등록 시도
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email,
          password: 'password123',
          name: 'Second User',
        })
        .expect(409);
    });

    it('should fail with invalid email', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid-email-format', // 실제 잘못된 이메일 형식
          password: 'password123',
          name: 'Test User',
        })
        .expect(400);
    });
  });

  describe('/auth/login (POST)', () => {
    let accessToken: string;
    let refreshToken: string;
    let loginEmail: string;

    beforeEach(async () => {
      loginEmail = `login${Date.now()}@example.com`;
      // 테스트용 사용자 등록
      await request(app.getHttpServer()).post('/auth/register').send({
        email: loginEmail,
        password: 'password123',
        name: 'Login User',
      });
    });

    it('should login successfully', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: loginEmail,
          password: 'password123',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user).toHaveProperty('email', loginEmail);
        });

      accessToken = res.body.accessToken;
      refreshToken = res.body.refreshToken;

      console.log(
        '로그인 성공 - 액세스 토큰:',
        accessToken.substring(0, 20) + '...',
      );
      console.log('리프레시 토큰:', refreshToken.substring(0, 20) + '...');
    });

    it('should fail with wrong password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: loginEmail,
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should fail with non-existent email', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
        .expect(401);
    });
  });

  describe('/auth/refresh (POST)', () => {
    let refreshToken: string;
    let accessToken: string;
    let refreshEmail: string;

    beforeEach(async () => {
      refreshEmail = `refresh${Date.now()}@example.com`;
      // 로그인하여 리프레시 토큰 획득
      await request(app.getHttpServer()).post('/auth/register').send({
        email: refreshEmail,
        password: 'password123',
        name: 'Refresh User',
      });

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: refreshEmail,
          password: 'password123',
        });

      refreshToken = loginResponse.body.refreshToken;
      accessToken = loginResponse.body.accessToken;

      console.log(
        '리프레시 테스트 - 원본 액세스 토큰:',
        accessToken.substring(0, 20) + '...',
      );
      console.log('리프레시 토큰:', refreshToken.substring(0, 20) + '...');

      // 토큰이 올바르게 생성되었는지 확인
      expect(refreshToken).toBeDefined();
      expect(refreshToken.length).toBeGreaterThan(0);
    });

    it('should refresh token successfully', async () => {
      // 리프레시 토큰이 유효한지 먼저 확인
      console.log('리프레시 토큰 길이:', refreshToken.length);
      console.log(
        '리프레시 토큰 형식:',
        refreshToken.split('.').length === 3
          ? '올바른 JWT 형식'
          : '잘못된 JWT 형식',
      );

      const res = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refreshToken,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
        });

      console.log(
        '토큰 갱신 성공 - 새 액세스 토큰:',
        res.body.accessToken.substring(0, 20) + '...',
      );
      console.log(
        '새 리프레시 토큰:',
        res.body.refreshToken.substring(0, 20) + '...',
      );
    });

    it('should fail with invalid refresh token', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refreshToken: 'invalid-token',
        })
        .expect(401);
    });
  });

  describe('/auth/me (GET)', () => {
    let accessToken: string;
    let meEmail: string;

    beforeEach(async () => {
      meEmail = `me${Date.now()}@example.com`;
      // 사용자 등록 및 로그인
      await request(app.getHttpServer()).post('/auth/register').send({
        email: meEmail,
        password: 'password123',
        name: 'Me User',
      });

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: meEmail,
          password: 'password123',
        });

      accessToken = loginResponse.body.accessToken;
      console.log(
        'Me 테스트 - 액세스 토큰:',
        accessToken.substring(0, 20) + '...',
      );
    });

    it('should get user profile with valid token', () => {
      return request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('email', meEmail);
          expect(res.body).toHaveProperty('name', 'Me User');
        });
    });

    it('should fail without token', () => {
      return request(app.getHttpServer()).get('/auth/me').expect(401);
    });

    it('should fail with invalid token', () => {
      return request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});
