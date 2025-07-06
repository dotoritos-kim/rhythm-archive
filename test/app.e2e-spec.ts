import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});

describe('검색 e2e', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/search/all (GET) - 통합 검색', async () => {
    const start = Date.now();
    const res = await request(app.getHttpServer())
      .get('/search/all')
      .query({ q: 'VANESSA' });
    const elapsed = Date.now() - start;
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.songs)).toBe(true);
    expect(res.body.songs.length).toBeGreaterThan(0);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.page).toBe(1);
    expect(res.body.pagination.limit).toBe(20);
    console.log('통합 검색 결과(상위 3개):', res.body.songs.slice(0, 3));
    console.log('통합 검색 소요(ms):', elapsed);
    console.log('페이지네이션 정보:', res.body.pagination);
  });

  it('/search/fulltext (GET) - 풀텍스트 검색', async () => {
    const start = Date.now();
    const res = await request(app.getHttpServer())
      .get('/search/fulltext')
      .query({ q: 'MAX 300' });
    const elapsed = Date.now() - start;
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.songs)).toBe(true);
    expect(res.body.songs.length).toBeGreaterThan(0);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.page).toBe(1);
    expect(res.body.pagination.limit).toBe(20);
    console.log('풀텍스트 검색 결과(상위 3개):', res.body.songs.slice(0, 3));
    console.log('풀텍스트 검색 소요(ms):', elapsed);
    console.log('페이지네이션 정보:', res.body.pagination);
  });

  it('/search/all (GET) - 페이지네이션 테스트', async () => {
    const res = await request(app.getHttpServer())
      .get('/search/all')
      .query({ q: 'VANESSA', page: 2, limit: 5 });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.songs)).toBe(true);
    expect(res.body.pagination).toBeDefined();
    expect(Number(res.body.pagination.page)).toBe(2);
    expect(Number(res.body.pagination.limit)).toBe(5);
    expect(res.body.songs.length).toBeLessThanOrEqual(5);
    console.log('페이지네이션 테스트 결과:', res.body.pagination);
  });

  afterAll(async () => {
    await app.close();
  });
});
