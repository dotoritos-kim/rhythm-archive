import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('CMS (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // 테스트용 사용자 등록 및 로그인
    const email = `cms${Date.now()}@example.com`;
    await request(app.getHttpServer()).post('/auth/register').send({
      email,
      password: 'password123',
      name: 'CMS User',
    });

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email,
        password: 'password123',
      });

    accessToken = loginResponse.body.accessToken;
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/cms/categories (POST)', () => {
    it('should create a new category', () => {
      return request(app.getHttpServer())
        .post('/cms/categories')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: '테스트 카테고리',
          slug: `test-category-${Date.now()}`,
          description: '테스트용 카테고리입니다.',
          order: 1,
          isActive: true,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('name', '테스트 카테고리');
          expect(res.body).toHaveProperty('slug');
          expect(res.body).toHaveProperty(
            'description',
            '테스트용 카테고리입니다.',
          );
          expect(res.body).toHaveProperty('order', 1);
          expect(res.body).toHaveProperty('isActive', true);
        });
    });

    it('should fail with duplicate slug', async () => {
      const duplicateSlug = `duplicate-slug-${Date.now()}`;
      // 먼저 카테고리 생성
      await request(app.getHttpServer())
        .post('/cms/categories')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: '첫 번째 카테고리',
          slug: duplicateSlug,
          description: '첫 번째 카테고리입니다.',
        });

      // 중복 슬러그로 다시 생성 시도
      return request(app.getHttpServer())
        .post('/cms/categories')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: '두 번째 카테고리',
          slug: duplicateSlug,
          description: '두 번째 카테고리입니다.',
        })
        .expect(400);
    });
  });

  describe('/cms/categories (GET)', () => {
    beforeEach(async () => {
      // 테스트용 카테고리들 생성
      await request(app.getHttpServer())
        .post('/cms/categories')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: '카테고리 1',
          slug: `category-1-${Date.now()}`,
          description: '첫 번째 카테고리',
          order: 1,
        });

      await request(app.getHttpServer())
        .post('/cms/categories')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: '카테고리 2',
          slug: `category-2-${Date.now()}`,
          description: '두 번째 카테고리',
          order: 2,
        });
    });

    it('should get all categories', () => {
      return request(app.getHttpServer())
        .get('/cms/categories')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThanOrEqual(2);
        });
    });

    it('should filter categories by isActive', () => {
      return request(app.getHttpServer())
        .get('/cms/categories?isActive=true')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          res.body.forEach((category: any) => {
            expect(category.isActive).toBe(true);
          });
        });
    });
  });

  describe('/cms/categories/:id (GET)', () => {
    let categoryId: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/cms/categories')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: '단건 조회 카테고리',
          slug: `single-category-${Date.now()}`,
          description: '단건 조회 테스트용 카테고리',
        });

      categoryId = response.body.id;
    });

    it('should get a single category', () => {
      return request(app.getHttpServer())
        .get(`/cms/categories/${categoryId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', categoryId);
          expect(res.body).toHaveProperty('name', '단건 조회 카테고리');
          expect(res.body).toHaveProperty('slug');
        });
    });

    it('should fail with non-existent category id', () => {
      return request(app.getHttpServer())
        .get('/cms/categories/non-existent-id')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('/cms/categories/:id (PATCH)', () => {
    let categoryId: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/cms/categories')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: '수정 전 카테고리',
          slug: `before-update-${Date.now()}`,
          description: '수정 전 설명',
        });

      categoryId = response.body.id;
    });

    it('should update a category', () => {
      return request(app.getHttpServer())
        .patch(`/cms/categories/${categoryId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: '수정 후 카테고리',
          description: '수정 후 설명',
          order: 5,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', categoryId);
          expect(res.body).toHaveProperty('name', '수정 후 카테고리');
          expect(res.body).toHaveProperty('description', '수정 후 설명');
          expect(res.body).toHaveProperty('order', 5);
        });
    });
  });

  describe('/cms/tags (POST)', () => {
    it('should create a new tag', () => {
      return request(app.getHttpServer())
        .post('/cms/tags')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: `테스트 태그 ${Date.now()}`,
          slug: `test-tag-${Date.now()}`,
          description: '테스트용 태그입니다.',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('name');
          expect(res.body).toHaveProperty('slug');
          expect(res.body).toHaveProperty(
            'description',
            '테스트용 태그입니다.',
          );
        });
    });
  });

  describe('/cms/posts (POST)', () => {
    let categoryId: string;
    let tagId: string;

    beforeEach(async () => {
      // 카테고리 생성
      const categoryResponse = await request(app.getHttpServer())
        .post('/cms/categories')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: '게시글 테스트 카테고리',
          slug: 'post-test-category',
          description: '게시글 테스트용 카테고리',
        });

      categoryId = categoryResponse.body.id;

      // 태그 생성
      const tagResponse = await request(app.getHttpServer())
        .post('/cms/tags')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: '게시글 테스트 태그',
          slug: 'post-test-tag',
          description: '게시글 테스트용 태그',
        });

      tagId = tagResponse.body.id;
    });

    it('should create a new post', () => {
      return request(app.getHttpServer())
        .post('/cms/posts')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: '테스트 게시글',
          slug: `test-post-${Date.now()}`,
          content: '테스트 게시글 내용입니다.',
          excerpt: '테스트 게시글 요약',
          status: 'PUBLISHED',
          isSticky: false,
          isCommentable: true,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('title', '테스트 게시글');
          expect(res.body).toHaveProperty('slug');
          expect(res.body).toHaveProperty(
            'content',
            '테스트 게시글 내용입니다.',
          );
          expect(res.body).toHaveProperty('excerpt', '테스트 게시글 요약');
          expect(res.body).toHaveProperty('status', 'PUBLISHED');
          expect(res.body).toHaveProperty('isSticky', false);
          expect(res.body).toHaveProperty('isCommentable', true);
        });
    });
  });
});
