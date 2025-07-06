import * as request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

describe('Favorites E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  let userId: string;
  let favoriteListId: string;
  let songId: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('회원가입/로그인 및 즐겨찾기 상세 조회', async () => {
    // 1. 회원가입
    const email = `test${Date.now()}@example.com`;
    const password = 'test1234';
    const name = 'testuser';
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password, name })
      .expect(201);

    // 2. 로그인
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(201);
    accessToken = loginRes.body.accessToken;
    userId = loginRes.body.user.id;

    console.log('로그인 성공 - 사용자 ID:', userId);
    console.log('액세스 토큰:', accessToken.substring(0, 20) + '...');

    // 3. 곡 생성 (직접 DB에 삽입)
    songId = uuidv4().replace(/-/g, '').substring(0, 32);
    const songTitle = `테스트곡_${Date.now()}`;
    await prisma.song.create({
      data: {
        id: songId,
        title: songTitle,
      },
    });

    // 4. 즐겨찾기 리스트 생성 (직접 DB에 삽입)
    favoriteListId = uuidv4().replace(/-/g, '').substring(0, 32);
    const favoriteList = await prisma.favoriteList.create({
      data: {
        id: favoriteListId,
        userId: userId, // 명시적으로 userId 설정
        name: '테스트 리스트',
        isPublic: false,
        isDefault: false,
      },
    });

    console.log('생성된 즐겨찾기 리스트:', favoriteList);

    // 디버깅: 생성된 리스트 확인
    const createdList = await prisma.favoriteList.findUnique({
      where: { id: favoriteListId },
    });
    console.log('DB에서 조회한 즐겨찾기 리스트:', createdList);
    console.log('사용자 ID:', userId);
    console.log('리스트 ID:', favoriteListId);

    // 5. 즐겨찾기 아이템 추가 (직접 DB에 삽입)
    const favoriteItemId = uuidv4().replace(/-/g, '').substring(0, 32);
    await prisma.favoriteItem.create({
      data: {
        id: favoriteItemId,
        favoriteListId,
        itemType: 'song',
        itemId: songId,
        title: '테스트곡',
      },
    });

    // 6. 즐겨찾기 리스트 상세 조회
    console.log('즐겨찾기 리스트 조회 시도...');
    console.log('요청할 리스트 ID:', favoriteListId);
    console.log('현재 사용자 ID:', userId);

    // 디버깅: 해당 사용자의 모든 즐겨찾기 리스트 확인
    const userLists = await prisma.favoriteList.findMany({
      where: { userId },
    });
    console.log('사용자의 모든 즐겨찾기 리스트:', userLists);

    const res = await request(app.getHttpServer())
      .get(`/favorites/${favoriteListId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    console.log('응답 상태:', res.status);
    console.log('응답 본문:', res.body);

    expect(res.body).toHaveProperty('id', favoriteListId);
    expect(res.body.items.length).toBeGreaterThan(0);
    expect(res.body.items[0]).toHaveProperty('songInfo');
    expect(res.body.items[0].songInfo).toHaveProperty('title', songTitle);
  });
});
