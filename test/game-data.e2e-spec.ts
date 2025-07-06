import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { v4 as uuidv4 } from 'uuid';

describe('GameDataController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: false }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const dummyGameData = (suffix = '') => ({
    game: {
      name: `테스트게임${suffix}`,
      releaseDate: '2024-07-01',
      publisher: `테스트퍼블리셔${suffix}`,
      extra: JSON.stringify({ note: '게임 extra' }),
    },
    songs: [
      {
        title: `테스트곡A${suffix}`,
        originalTitle: `OriginalA${suffix}`,
        songInfo: {
          bpm: 180,
          beat: '4/4',
          lengthSec: 120,
          extra: JSON.stringify({ info: '곡A info' }),
        },
        composers: [
          { name: `작곡가1${suffix}` },
          { name: `작곡가2${suffix}`, companyName: `회사${suffix}` },
        ],
        gameVersions: [
          {
            inGameTitle: `게임내제목A${suffix}`,
            bpmOverride: 182,
            arrangement: 'ArrA',
            charts: [
              {
                difficultyName: 'EASY',
                level: 3,
                chartType: 'Single',
                noteCount: 100,
              },
              {
                difficultyName: 'HARD',
                level: 10,
                chartType: 'Double',
                noteCount: 300,
              },
            ],
            dlcName: `DLC1${suffix}`,
            dlcReleaseDate: '2024-07-10',
          },
        ],
        tags: ['EDM', 'K-POP'],
      },
      {
        title: `테스트곡B${suffix}`,
        gameVersions: [
          {
            inGameTitle: `게임내제목B${suffix}`,
            charts: [
              { difficultyName: 'NORMAL', level: 5, chartType: 'Single' },
            ],
          },
        ],
      },
    ],
    courses: [
      {
        courseName: `코스1${suffix}`,
        difficulty: 'EXPERT',
        dlcName: `DLC1${suffix}`,
        courseEntries: [
          {
            songTitle: `테스트곡A${suffix}`,
            difficultyName: 'HARD',
            chartType: 'Double',
            position: 1,
          },
          {
            songTitle: `테스트곡B${suffix}`,
            difficultyName: 'NORMAL',
            chartType: 'Single',
            position: 2,
          },
        ],
        extra: JSON.stringify({ comment: '코스1' }),
      },
    ],
  });

  it('POST /game-data - 다양한 곡/차트/코스/작곡가/태그/DLC 등록', async () => {
    const uniqueSuffix = uuidv4().substring(0, 8);
    const res = await request(app.getHttpServer())
      .post('/game-data')
      .send(dummyGameData(uniqueSuffix))
      .expect(201);
    expect(res.body.game.name).toContain(`테스트게임${uniqueSuffix}`);
    expect(res.body.songs.length).toBeGreaterThan(0);
  });

  it('GET /game-data/:gameName - 등록된 게임 데이터 조회', async () => {
    const uniqueSuffix = uuidv4().substring(0, 8);
    const gameData = dummyGameData(uniqueSuffix);

    // 먼저 게임 데이터를 등록
    await request(app.getHttpServer())
      .post('/game-data')
      .send(gameData)
      .expect(201);

    // 등록된 게임 데이터 조회
    const res = await request(app.getHttpServer())
      .get(encodeURI(`/game-data/${gameData.game.name}`))
      .expect(200);
    expect(res.body.name).toBe(gameData.game.name);
    expect(res.body.songGameVersions.length).toBeGreaterThan(0);
  });

  it('POST /game-data - 대량 데이터 등록', async () => {
    const uniqueSuffix = uuidv4().substring(0, 8);
    const manySongs = Array.from({ length: 20 }).map((_, i) => ({
      title: `곡${i}${uniqueSuffix}`,
      gameVersions: [
        {
          inGameTitle: `곡${i}버전${uniqueSuffix}`,
          charts: [
            { difficultyName: 'EASY', level: 1 + i, chartType: 'Single' },
          ],
        },
      ],
    }));
    const data = dummyGameData(uniqueSuffix);
    data.songs = manySongs;
    const res = await request(app.getHttpServer())
      .post('/game-data')
      .send(data)
      .expect(201);
    expect(res.body.songs.length).toBe(20);
  });

  it('POST /game-data - 필수값 누락시 400', async () => {
    const uniqueSuffix = uuidv4().substring(0, 8);
    const data = dummyGameData(uniqueSuffix);
    // 곡 제목 누락
    data.songs[0].title = undefined as any;
    await request(app.getHttpServer())
      .post('/game-data')
      .send(data)
      .expect(400);
  });

  // UPDATE/DELETE 테스트는 실제 구현에 따라 추가 가능
  // 예: 곡 정보 수정, 태그 삭제 등
});
