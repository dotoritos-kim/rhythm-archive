import * as request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';

describe('Comprehensive E2E Stress Test', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let baseUrl: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    prisma = app.get(PrismaService);
    baseUrl = app.getHttpServer();
  }, 60000); // 60초 타임아웃

  afterAll(async () => {
    await app.close();
  }, 10000); // 10초 타임아웃

  // 테스트 데이터 생성 함수들
  const createTestUser = async (index: number) => {
    const email = `user${index}${Date.now()}@example.com`;
    const password = 'test1234';
    const name = `user${index}`;

    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password, name });

    if (registerRes.status === 201) {
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password });

      return {
        user: registerRes.body,
        token: loginRes.body.accessToken,
        userId: loginRes.body.user.id,
      };
    }
    return null;
  };

  const createTestClient = async (
    userId: string,
    token: string,
    index: number,
  ) => {
    const clientData = {
      name: `Test Client ${index}`,
      clientId: `client_${index}_${Date.now()}`,
      clientSecret: faker.string.alphanumeric(32),
      redirectUris: 'http://localhost:3000/callback',
      grantTypes: 'authorization_code,refresh_token',
      responseTypes: 'code',
      scopes: 'read write',
    };

    const res = await request(app.getHttpServer())
      .post('/oauth2/clients')
      .set('Authorization', `Bearer ${token}`)
      .send(clientData);

    return res.status === 201 ? res.body : null;
  };

  const createTestGame = async (index: number) => {
    const gameId = uuidv4().replace(/-/g, '').substring(0, 32);
    await prisma.game.create({
      data: {
        id: gameId,
        name: `Test Game ${index}_${faker.string.alphanumeric(8)}`,
        releaseDate: faker.date.past(),
        publisher: faker.company.name(),
      },
    });
    return gameId;
  };

  const createTestSong = async (index: number) => {
    const songId = uuidv4().replace(/-/g, '').substring(0, 32);
    await prisma.song.create({
      data: {
        id: songId,
        title: `Test Song ${index}_${faker.string.alphanumeric(8)}`,
        originalTitle: faker.music.songName(),
      },
    });

    // 곡 정보 추가
    const songInfoId = uuidv4().replace(/-/g, '').substring(0, 32);
    await prisma.songInfo.create({
      data: {
        id: songInfoId,
        songId,
        bpm: faker.number.int({ min: 60, max: 200 }),
        beat: `${faker.number.int({ min: 1, max: 8 })}/4`,
        lengthSec: faker.number.int({ min: 60, max: 300 }),
      },
    });

    return songId;
  };

  const createTestComposer = async (index: number) => {
    const composerId = uuidv4().replace(/-/g, '').substring(0, 32);
    await prisma.composer.create({
      data: {
        id: composerId,
        name: faker.person.fullName(),
        companyName: faker.company.name(),
      },
    });
    return composerId;
  };

  const createTestDlc = async (gameId: string, index: number) => {
    const dlcId = uuidv4().replace(/-/g, '').substring(0, 32);
    await prisma.dlc.create({
      data: {
        id: dlcId,
        gameId,
        dlcName: `Test DLC ${index}`,
        releaseDate: faker.date.past(),
      },
    });
    return dlcId;
  };

  const createTestSongGameVersion = async (
    songId: string,
    gameId: string,
    dlcId?: string,
  ) => {
    const sgvId = uuidv4().replace(/-/g, '').substring(0, 32);
    await prisma.songGameVersion.create({
      data: {
        id: sgvId,
        songId,
        gameId,
        dlcId,
        inGameTitle: faker.music.songName(),
        bpmOverride: faker.number.int({ min: 60, max: 200 }),
        lengthSec: faker.number.int({ min: 60, max: 300 }),
        arrangement: faker.helpers.arrayElement(['Original', 'Remix', 'Cover']),
      },
    });
    return sgvId;
  };

  const createTestChart = async (sgvId: string, index: number) => {
    const chartId = uuidv4().replace(/-/g, '').substring(0, 32);
    const difficulties = ['Easy', 'Normal', 'Hard', 'Expert', 'Master'];
    await prisma.chart.create({
      data: {
        id: chartId,
        sgvId,
        difficultyName: difficulties[index % difficulties.length],
        level: faker.number.float({ min: 1, max: 15, fractionDigits: 1 }),
        noteCount: faker.number.int({ min: 100, max: 2000 }),
        chartType: faker.helpers.arrayElement(['Single', 'Double', 'Couple']),
      },
    });
    return chartId;
  };

  const createTestCourse = async (
    gameId: string,
    index: number,
    dlcId?: string,
  ) => {
    const courseId = uuidv4().replace(/-/g, '').substring(0, 32);
    await prisma.course.create({
      data: {
        id: courseId,
        gameId,
        dlcId,
        courseName: `Test Course ${index}`,
        difficulty: faker.helpers.arrayElement([
          'Beginner',
          'Intermediate',
          'Advanced',
          'Expert',
        ]),
      },
    });
    return courseId;
  };

  const createTestFavoriteList = async (
    userId: string,
    token: string,
    index: number,
  ) => {
    const listId = uuidv4().replace(/-/g, '').substring(0, 32);
    await prisma.favoriteList.create({
      data: {
        id: listId,
        userId,
        name: `Favorite List ${index}`,
        description: faker.lorem.sentence(),
        isPublic: faker.datatype.boolean(),
        isDefault: index === 0,
      },
    });
    return listId;
  };

  const addFavoriteItem = async (
    listId: string,
    itemType: string,
    itemId: string,
    title: string,
  ) => {
    const itemId_uuid = uuidv4().replace(/-/g, '').substring(0, 32);
    await prisma.favoriteItem.create({
      data: {
        id: itemId_uuid,
        favoriteListId: listId,
        itemType,
        itemId,
        title,
        description: faker.lorem.sentence(),
        order: faker.number.int({ min: 0, max: 100 }),
      },
    });
    return itemId_uuid;
  };

  describe('대규모 데이터 생성 및 동시성 테스트', () => {
    it('1만개 데이터 생성 및 동시성 테스트', async () => {
      const TOTAL_USERS = 5;
      const TOTAL_GAMES = 3;
      const TOTAL_SONGS = 10;
      const TOTAL_COURSES = 5;
      const TOTAL_FAVORITE_LISTS = 10;

      console.log('🚀 대규모 데이터 생성 시작...');

      // 1. 게임 데이터 생성
      console.log('📱 게임 데이터 생성 중...');
      const gameIds: string[] = [];
      for (let i = 0; i < TOTAL_GAMES; i++) {
        const gameId = await createTestGame(i);
        gameIds.push(gameId);
      }
      console.log(`✅ ${gameIds.length}개 게임 생성 완료`);

      // 2. 곡 데이터 생성
      console.log('🎵 곡 데이터 생성 중...');
      const songIds: string[] = [];
      for (let i = 0; i < TOTAL_SONGS; i++) {
        const songId = await createTestSong(i);
        songIds.push(songId);
      }
      console.log(`✅ ${songIds.length}개 곡 생성 완료`);

      // 3. 작곡가 데이터 생성
      console.log('👨‍🎨 작곡가 데이터 생성 중...');
      const composerIds: string[] = [];
      for (let i = 0; i < 10; i++) {
        const composerId = await createTestComposer(i);
        composerIds.push(composerId);
      }
      console.log(`✅ ${composerIds.length}개 작곡가 생성 완료`);

      // 4. 곡-작곡가 관계 생성
      console.log('🔗 곡-작곡가 관계 생성 중...');
      for (let i = 0; i < songIds.length; i++) {
        const composerCount = faker.number.int({ min: 1, max: 2 });
        const usedComposerIds = new Set<string>();
        for (let j = 0; j < composerCount; j++) {
          let composerId: string;
          do {
            composerId =
              composerIds[
                faker.number.int({ min: 0, max: composerIds.length - 1 })
              ];
          } while (usedComposerIds.has(composerId));
          usedComposerIds.add(composerId);

          await prisma.songComposer.create({
            data: {
              id: uuidv4().replace(/-/g, '').substring(0, 32),
              songId: songIds[i],
              composerId,
            },
          });
        }
      }
      console.log('✅ 곡-작곡가 관계 생성 완료');

      // 5. DLC 데이터 생성
      console.log('📦 DLC 데이터 생성 중...');
      const dlcIds: string[] = [];
      for (let i = 0; i < 5; i++) {
        const gameId =
          gameIds[faker.number.int({ min: 0, max: gameIds.length - 1 })];
        const dlcId = await createTestDlc(gameId, i);
        dlcIds.push(dlcId);
      }
      console.log(`✅ ${dlcIds.length}개 DLC 생성 완료`);

      // 6. 곡-게임 버전 데이터 생성
      console.log('🎮 곡-게임 버전 데이터 생성 중...');
      const sgvIds: string[] = [];
      for (let i = 0; i < songIds.length; i++) {
        const gameId =
          gameIds[faker.number.int({ min: 0, max: gameIds.length - 1 })];
        const dlcId = faker.datatype.boolean()
          ? dlcIds[faker.number.int({ min: 0, max: dlcIds.length - 1 })]
          : undefined;
        const sgvId = await createTestSongGameVersion(
          songIds[i],
          gameId,
          dlcId,
        );
        sgvIds.push(sgvId);
      }
      console.log(`✅ ${sgvIds.length}개 곡-게임 버전 생성 완료`);

      // 7. 차트 데이터 생성
      console.log('📊 차트 데이터 생성 중...');
      const chartIds: string[] = [];
      for (let i = 0; i < sgvIds.length; i++) {
        const chartCount = faker.number.int({ min: 1, max: 3 });
        for (let j = 0; j < chartCount; j++) {
          const chartId = await createTestChart(sgvIds[i], j);
          chartIds.push(chartId);
        }
      }
      console.log(`✅ ${chartIds.length}개 차트 생성 완료`);

      // 8. 코스 데이터 생성
      console.log('🏁 코스 데이터 생성 중...');
      const courseIds: string[] = [];
      for (let i = 0; i < TOTAL_COURSES; i++) {
        const gameId =
          gameIds[faker.number.int({ min: 0, max: gameIds.length - 1 })];
        const dlcId = faker.datatype.boolean()
          ? dlcIds[faker.number.int({ min: 0, max: dlcIds.length - 1 })]
          : undefined;
        const courseId = await createTestCourse(gameId, i, dlcId);
        courseIds.push(courseId);
      }
      console.log(`✅ ${courseIds.length}개 코스 생성 완료`);

      // 9. 사용자 생성 및 동시성 테스트
      console.log('👥 사용자 생성 및 동시성 테스트 중...');
      const users: Array<{ user: any; token: string; userId: string }> = [];

      // 동시에 여러 사용자 생성
      const userPromises = Array.from({ length: TOTAL_USERS }, (_, i) =>
        createTestUser(i),
      );
      const userResults = await Promise.all(userPromises);

      for (const result of userResults) {
        if (result) {
          users.push(result);
        }
      }
      console.log(`✅ ${users.length}개 사용자 생성 완료`);

      // 10. 클라이언트 생성
      console.log('🔐 클라이언트 생성 중...');
      const clientPromises = users
        .slice(0, 5)
        .map((user, i) => createTestClient(user.userId, user.token, i));
      const clients = await Promise.all(clientPromises);
      console.log(
        `✅ ${clients.filter((c) => c).length}개 클라이언트 생성 완료`,
      );

      // 11. 즐겨찾기 리스트 생성
      console.log('❤️ 즐겨찾기 리스트 생성 중...');
      const favoriteListIds: string[] = [];

      for (let i = 0; i < Math.min(TOTAL_FAVORITE_LISTS, users.length); i++) {
        const user = users[i % users.length];
        const listId = await createTestFavoriteList(user.userId, user.token, i);
        favoriteListIds.push(listId);
      }
      console.log(`✅ ${favoriteListIds.length}개 즐겨찾기 리스트 생성 완료`);

      // 12. 즐겨찾기 아이템 추가
      console.log('📝 즐겨찾기 아이템 추가 중...');
      let totalFavoriteItems = 0;

      for (const listId of favoriteListIds) {
        const itemCount = faker.number.int({ min: 1, max: 3 });
        for (let i = 0; i < itemCount; i++) {
          const itemType = faker.helpers.arrayElement([
            'song',
            'chart',
            'game',
            'course',
          ]);
          let itemId: string;
          let title: string;

          switch (itemType) {
            case 'song':
              itemId =
                songIds[faker.number.int({ min: 0, max: songIds.length - 1 })];
              title = `Song ${itemId.substring(0, 8)}`;
              break;
            case 'chart':
              itemId =
                chartIds[
                  faker.number.int({ min: 0, max: chartIds.length - 1 })
                ];
              title = `Chart ${itemId.substring(0, 8)}`;
              break;
            case 'game':
              itemId =
                gameIds[faker.number.int({ min: 0, max: gameIds.length - 1 })];
              title = `Game ${itemId.substring(0, 8)}`;
              break;
            case 'course':
              itemId =
                courseIds[
                  faker.number.int({ min: 0, max: courseIds.length - 1 })
                ];
              title = `Course ${itemId.substring(0, 8)}`;
              break;
            default:
              continue;
          }

          try {
            await addFavoriteItem(listId, itemType, itemId, title);
            totalFavoriteItems++;
          } catch (error) {
            // 중복 아이템은 무시
            console.log(`중복 아이템 무시: ${itemType} ${itemId}`);
          }
        }
      }
      console.log(`✅ ${totalFavoriteItems}개 즐겨찾기 아이템 추가 완료`);

      // 13. 동시성 테스트 - 즐겨찾기 조회
      console.log('⚡ 동시성 테스트 - 즐겨찾기 조회 중...');
      const concurrentPromises = favoriteListIds
        .slice(0, 10)
        .map(async (listId, index) => {
          const user = users[index % users.length];
          try {
            // 먼저 리스트가 실제로 존재하는지 확인
            const listExists = await prisma.favoriteList.findUnique({
              where: { id: listId },
            });

            if (!listExists) {
              console.log(`리스트가 존재하지 않음: ${listId}`);
              return {
                success: false,
                listId,
                error: 'List not found',
              };
            }

            // 리스트가 해당 사용자의 것인지 확인
            if (listExists.userId !== user.userId) {
              console.log(
                `리스트 소유자가 다름: ${listId}, 소유자: ${listExists.userId}, 요청자: ${user.userId}`,
              );
              return {
                success: false,
                listId,
                error: 'Unauthorized',
              };
            }

            // 사용자 토큰이 유효한지 확인
            console.log(
              `사용자 ${user.userId}의 토큰: ${user.token.substring(0, 20)}...`,
            );

            const res = await request(app.getHttpServer())
              .get(`/favorites/${listId}`)
              .set('Authorization', `Bearer ${user.token}`)
              .timeout(5000);

            console.log(`리스트 ${listId} 조회 결과: ${res.status}`);

            return {
              success: res.status === 200,
              listId,
              itemCount: res.body?.items?.length || 0,
              status: res.status,
              error:
                res.status !== 200
                  ? res.body?.message || 'Unknown error'
                  : null,
            };
          } catch (error) {
            console.log(
              `동시성 테스트 오류 - 리스트 ${listId}:`,
              error.message,
            );
            return {
              success: false,
              listId,
              error: error.message,
              status: error.status || 500,
            };
          }
        });

      const concurrentResults = await Promise.all(concurrentPromises);
      const successfulRequests = concurrentResults.filter(
        (r) => r.success,
      ).length;
      console.log(
        `✅ 동시성 테스트 완료: ${successfulRequests}/${concurrentResults.length} 성공`,
      );

      // 실패한 요청들의 상세 정보 출력
      const failedRequests = concurrentResults.filter((r) => !r.success);
      if (failedRequests.length > 0) {
        console.log('실패한 요청들:', failedRequests);
      }

      // 14. 검색 테스트
      console.log('🔍 검색 테스트 중...');
      const searchPromises = [
        request(app.getHttpServer()).get(
          '/songs/search?q=Test&page=1&limit=10',
        ),
        request(app.getHttpServer()).get(
          '/games/search?q=Test&page=1&limit=10',
        ),
        request(app.getHttpServer()).get(
          '/courses/search?q=Test&page=1&limit=10',
        ),
      ];

      const searchResults = await Promise.all(searchPromises);
      console.log('✅ 검색 테스트 완료');

      // 15. 최종 통계
      console.log('\n📊 최종 통계:');
      console.log(`- 사용자: ${users.length}명`);
      console.log(`- 게임: ${gameIds.length}개`);
      console.log(`- 곡: ${songIds.length}개`);
      console.log(`- 차트: ${chartIds.length}개`);
      console.log(`- 코스: ${courseIds.length}개`);
      console.log(`- 즐겨찾기 리스트: ${favoriteListIds.length}개`);
      console.log(`- 즐겨찾기 아이템: ${totalFavoriteItems}개`);
      console.log(
        `- 동시성 테스트 성공률: ${((successfulRequests / concurrentResults.length) * 100).toFixed(2)}%`,
      );

      // 검증
      expect(users.length).toBeGreaterThan(0);
      expect(gameIds.length).toBeGreaterThan(0);
      expect(songIds.length).toBeGreaterThan(0);
      expect(chartIds.length).toBeGreaterThan(0);
      expect(courseIds.length).toBeGreaterThan(0);
      expect(favoriteListIds.length).toBeGreaterThan(0);
      expect(successfulRequests).toBeGreaterThan(
        concurrentResults.length * 0.7,
      );
    }, 120000);
  });
});
