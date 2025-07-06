import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker/locale/ko';

const prisma = new PrismaClient();

// 테스트용 계정 정보
const TEST_USER_EMAIL = 'test@example.com';
const TEST_USER_PASSWORD = 'test123';
const TEST_CLIENT_ID = 'test-client';
const TEST_CLIENT_SECRET = 'test-secret';

// 32자 ID 생성 함수
function generateId(): string {
  return faker.string.alphanumeric(32);
}

// 고유한 slug 생성 함수
function generateUniqueSlug(base: string, existingSlugs: Set<string>): string {
  let slug = faker.helpers.slugify(base).toLowerCase();
  let counter = 1;
  let finalSlug = slug;

  while (existingSlugs.has(finalSlug)) {
    finalSlug = `${slug}-${counter}`;
    counter++;
  }

  existingSlugs.add(finalSlug);
  return finalSlug;
}

async function generateMassiveDummyData() {
  console.log('🚀 대규모 더미데이터 생성 시작...');

  try {
    // 1. 기존 데이터 완전 삭제 (순서 중요)
    console.log('🗑️ 기존 데이터 삭제 중...');
    await prisma.favoriteItemTag.deleteMany();
    await prisma.favoriteTag.deleteMany();
    await prisma.favoriteItem.deleteMany();
    await prisma.favoriteList.deleteMany();
    await prisma.songTagItem.deleteMany();
    await prisma.songTag.deleteMany();
    await prisma.courseEntry.deleteMany();
    await prisma.course.deleteMany();
    await prisma.chart.deleteMany();
    await prisma.songGameVersion.deleteMany();
    await prisma.dlc.deleteMany();
    await prisma.songComposer.deleteMany();
    await prisma.songInfo.deleteMany();
    await prisma.song.deleteMany();
    await prisma.composer.deleteMany();
    await prisma.game.deleteMany();
    await prisma.postAttachment.deleteMany();
    await prisma.attachment.deleteMany();
    await prisma.postTag.deleteMany();
    await prisma.tag.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.post.deleteMany();
    await prisma.category.deleteMany();
    await prisma.authorizationCode.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.accessToken.deleteMany();
    await prisma.session.deleteMany();
    await prisma.client.deleteMany();
    await prisma.userInfo.deleteMany();
    await prisma.user.deleteMany();
    await prisma.permission.deleteMany();
    await prisma.role.deleteMany();

    // 2. 역할 생성
    console.log('👑 역할 생성 중...');
    const userRole = await prisma.role.create({
      data: {
        id: generateId(),
        name: 'USER',
      },
    });

    // 3. 테스트용 사용자 생성
    console.log('👤 테스트용 사용자 생성 중...');
    const testUser = await prisma.user.create({
      data: {
        id: generateId(),
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD,
        name: '테스트 사용자',
        roleId: userRole.id,
      },
    });

    // 4. 테스트용 OAuth2 클라이언트 생성
    console.log('🔑 테스트용 OAuth2 클라이언트 생성 중...');
    const testClient = await prisma.client.create({
      data: {
        id: generateId(),
        clientId: TEST_CLIENT_ID,
        clientSecret: TEST_CLIENT_SECRET,
        name: '테스트 클라이언트',
        redirectUris: JSON.stringify(['http://localhost:3000/callback']),
        grantTypes: JSON.stringify(['authorization_code', 'refresh_token']),
        responseTypes: JSON.stringify(['code']),
        scopes: JSON.stringify(['read', 'write']),
        ownerId: testUser.id,
      },
    });

    // 5. 카테고리 생성 (5,000개)
    console.log('📂 카테고리 생성 중... (5,000개)');
    const categories: any[] = [];
    const categorySlugs = new Set<string>();
    for (let i = 0; i < 5000; i++) {
      const baseName = faker.commerce.department();
      categories.push({
        id: generateId(),
        name: baseName,
        slug: generateUniqueSlug(baseName, categorySlugs),
      });
    }
    await prisma.category.createMany({ data: categories });
    const createdCategories = await prisma.category.findMany();
    console.log(`✅ ${createdCategories.length}개 카테고리 생성 완료`);

    // 6. 태그 생성 (10,000개)
    console.log('🏷️ 태그 생성 중... (10,000개)');
    const tags: any[] = [];
    const tagSlugs = new Set<string>();
    const tagNames = new Set<string>();
    for (let i = 0; i < 10000; i++) {
      let baseName = faker.word.noun();
      let counter = 1;
      let finalName = baseName;

      // 이름 중복 방지
      while (tagNames.has(finalName)) {
        finalName = `${baseName}-${counter}`;
        counter++;
      }
      tagNames.add(finalName);

      tags.push({
        id: generateId(),
        name: finalName,
        slug: generateUniqueSlug(finalName, tagSlugs),
      });
    }
    await prisma.tag.createMany({ data: tags });
    const createdTags = await prisma.tag.findMany();
    console.log(`✅ ${createdTags.length}개 태그 생성 완료`);

    // 6-1. 노래 태그(SongTagItem) 생성 (10,000개)
    console.log('🏷️ 노래 태그(SongTagItem) 생성 중... (10,000개)');
    const songTagItems: any[] = [];
    const songTagItemNames = new Set<string>();
    for (let i = 0; i < 10000; i++) {
      let baseName = faker.word.noun();
      let finalName = baseName;
      let counter = 1;
      while (songTagItemNames.has(finalName)) {
        finalName = `${baseName}-${counter}`;
        counter++;
      }
      songTagItemNames.add(finalName);
      songTagItems.push({
        id: generateId(),
        name: finalName,
      });
    }
    await prisma.songTagItem.createMany({ data: songTagItems });
    const createdSongTagItems = await prisma.songTagItem.findMany();
    console.log(`✅ ${createdSongTagItems.length}개 노래 태그 생성 완료`);

    // 7. 게임 생성 (1,000개)
    console.log('🎮 게임 생성 중... (1,000개)');
    const games: any[] = [];
    const gameNames = new Set<string>();
    for (let i = 0; i < 1000; i++) {
      let baseName = faker.company.name() + ' ' + faker.word.noun();
      let finalName = baseName;
      let counter = 1;
      while (gameNames.has(finalName)) {
        finalName = `${baseName}-${counter}`;
        counter++;
      }
      gameNames.add(finalName);
      games.push({
        id: generateId(),
        name: finalName,
        releaseDate: faker.date.past(),
        publisher: faker.company.name(),
        extra: faker.lorem.sentence(),
      });
    }
    await prisma.game.createMany({ data: games });
    const createdGames = await prisma.game.findMany();
    console.log(`✅ ${createdGames.length}개 게임 생성 완료`);

    // 8. 작곡가 생성 (2,000개)
    console.log('🎼 작곡가 생성 중... (2,000개)');
    const composers: any[] = [];
    for (let i = 0; i < 2000; i++) {
      composers.push({
        id: generateId(),
        name: faker.person.fullName(),
        companyName: faker.company.name(),
        extra: faker.lorem.sentence(),
      });
    }
    await prisma.composer.createMany({ data: composers });
    const createdComposers = await prisma.composer.findMany();
    console.log(`✅ ${createdComposers.length}개 작곡가 생성 완료`);

    // 9. 곡 생성 (20,000개)
    console.log('🎵 곡 생성 중... (20,000개)');
    const songs: any[] = [];
    const songTitles = new Set<string>();
    for (let i = 0; i < 20000; i++) {
      let baseTitle = faker.music.songName();
      let finalTitle = baseTitle;
      let counter = 1;
      while (songTitles.has(finalTitle)) {
        finalTitle = `${baseTitle}-${counter}`;
        counter++;
      }
      songTitles.add(finalTitle);
      songs.push({
        id: generateId(),
        title: finalTitle,
        originalTitle: faker.music.songName(),
      });
    }
    await prisma.song.createMany({ data: songs });
    const createdSongs = await prisma.song.findMany();
    console.log(`✅ ${createdSongs.length}개 곡 생성 완료`);

    // 10. 곡-작곡가 관계 생성 (40,000개)
    console.log('🎵🎼 곡-작곡가 관계 생성 중... (40,000개)');
    const songComposers: any[] = [];
    for (let i = 0; i < 40000; i++) {
      const songId =
        createdSongs[faker.number.int({ min: 0, max: createdSongs.length - 1 })]
          .id;
      const composerId =
        createdComposers[
          faker.number.int({ min: 0, max: createdComposers.length - 1 })
        ].id;

      // 중복 방지
      const exists = songComposers.some(
        (sc) => sc.songId === songId && sc.composerId === composerId,
      );
      if (!exists) {
        songComposers.push({
          id: generateId(),
          songId,
          composerId,
        });
      }
    }
    await prisma.songComposer.createMany({ data: songComposers });
    console.log(`✅ ${songComposers.length}개 곡-작곡가 관계 생성 완료`);

    // 11. 곡-게임 버전 관계 생성 (30,000개)
    console.log('🎵🎮 곡-게임 버전 관계 생성 중... (30,000개)');
    const songGameVersions: any[] = [];
    for (let i = 0; i < 30000; i++) {
      const songId =
        createdSongs[faker.number.int({ min: 0, max: createdSongs.length - 1 })]
          .id;
      const gameId =
        createdGames[faker.number.int({ min: 0, max: createdGames.length - 1 })]
          .id;

      // 중복 방지
      const exists = songGameVersions.some(
        (sgv) => sgv.songId === songId && sgv.gameId === gameId,
      );
      if (!exists) {
        songGameVersions.push({
          id: generateId(),
          songId,
          gameId,
        });
      }
    }
    await prisma.songGameVersion.createMany({ data: songGameVersions });
    console.log(`✅ ${songGameVersions.length}개 곡-게임 버전 관계 생성 완료`);

    // 12. 곡-태그 관계 생성 (50,000개)
    console.log('🎵🏷️ 곡-태그 관계 생성 중... (50,000개)');
    const songTags: any[] = [];
    for (let i = 0; i < 50000; i++) {
      const songId =
        createdSongs[faker.number.int({ min: 0, max: createdSongs.length - 1 })]
          .id;
      const tagId =
        createdSongTagItems[
          faker.number.int({ min: 0, max: createdSongTagItems.length - 1 })
        ].id;
      const exists = songTags.some(
        (st) => st.songId === songId && st.tagId === tagId,
      );
      if (!exists) {
        songTags.push({
          id: generateId(),
          songId,
          tagId,
        });
      }
    }
    await prisma.songTag.createMany({ data: songTags });
    console.log(`✅ ${songTags.length}개 곡-태그 관계 생성 완료`);

    // 13. 게시글 생성 (5,000개)
    console.log('📝 게시글 생성 중... (5,000개)');
    const posts: any[] = [];
    const postSlugs = new Set<string>();
    for (let i = 0; i < 5000; i++) {
      const title = faker.lorem.sentence();
      let baseSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-');
      let finalSlug = baseSlug;
      let counter = 1;
      while (postSlugs.has(finalSlug)) {
        finalSlug = `${baseSlug}-${counter}`;
        counter++;
      }
      postSlugs.add(finalSlug);
      posts.push({
        id: generateId(),
        title: title,
        content: faker.lorem.paragraphs(3),
        slug: finalSlug,
        authorId: testUser.id,
        categoryId:
          createdCategories[
            faker.number.int({ min: 0, max: createdCategories.length - 1 })
          ].id,
      });
    }
    await prisma.post.createMany({ data: posts });
    console.log(`✅ ${posts.length}개 게시글 생성 완료`);

    // 14. 첨부파일 생성 (5,000개)
    console.log('📎 첨부파일 생성 중... (5,000개)');
    const attachments: any[] = [];
    for (let i = 0; i < 5000; i++) {
      attachments.push({
        id: generateId(),
        filename: faker.system.fileName(),
        originalName: faker.system.fileName(),
        path: faker.system.filePath(),
        url: faker.internet.url(),
        mimeType: faker.system.mimeType(),
        size: faker.number.int({ min: 1000, max: 10000000 }),
        uploaderId: testUser.id,
      });
    }
    await prisma.attachment.createMany({ data: attachments });
    const createdAttachments = await prisma.attachment.findMany();
    console.log(`✅ ${createdAttachments.length}개 첨부파일 생성 완료`);

    // 14-1. 즐겨찾기 리스트 생성 (1,000개)
    console.log('📋 즐겨찾기 리스트 생성 중... (1,000개)');
    const favoriteLists: any[] = [];
    for (let i = 0; i < 1000; i++) {
      favoriteLists.push({
        id: generateId(),
        name: faker.lorem.words(3),
        userId: testUser.id,
      });
    }
    await prisma.favoriteList.createMany({ data: favoriteLists });
    const createdFavoriteLists = await prisma.favoriteList.findMany();
    console.log(
      `✅ ${createdFavoriteLists.length}개 즐겨찾기 리스트 생성 완료`,
    );

    // 15. 즐겨찾기 생성 (10,000개)
    console.log('⭐ 즐겨찾기 생성 중... (10,000개)');
    const favorites: any[] = [];
    for (let i = 0; i < 10000; i++) {
      const songId =
        createdSongs[faker.number.int({ min: 0, max: createdSongs.length - 1 })]
          .id;
      const favoriteListId =
        createdFavoriteLists[
          faker.number.int({ min: 0, max: createdFavoriteLists.length - 1 })
        ].id;
      const exists = favorites.some(
        (fav) => fav.songId === songId && fav.favoriteListId === favoriteListId,
      );
      if (!exists) {
        favorites.push({
          id: generateId(),
          songId,
          favoriteListId,
          userId: testUser.id,
          itemType: 'SONG',
          itemId: songId,
        });
      }
    }
    await prisma.favoriteItem.createMany({ data: favorites });
    console.log(`✅ ${favorites.length}개 즐겨찾기 생성 완료`);

    console.log('🎉 대규모 더미데이터 생성 완료!');
    console.log('\n📊 생성된 데이터 요약:');
    console.log(`- 역할: 1개`);
    console.log(`- 사용자: 1개 (테스트용)`);
    console.log(`- OAuth2 클라이언트: 1개 (테스트용)`);
    console.log(`- 카테고리: ${createdCategories.length}개`);
    console.log(`- 태그: ${createdTags.length}개`);
    console.log(`- 게임: ${createdGames.length}개`);
    console.log(`- 작곡가: ${createdComposers.length}개`);
    console.log(`- 곡: ${createdSongs.length}개`);
    console.log(`- 곡-작곡가 관계: ${songComposers.length}개`);
    console.log(`- 곡-게임 버전 관계: ${songGameVersions.length}개`);
    console.log(`- 곡-태그 관계: ${songTags.length}개`);
    console.log(`- 게시글: ${posts.length}개`);
    console.log(`- 첨부파일: ${createdAttachments.length}개`);
    console.log(`- 즐겨찾기: ${favorites.length}개`);
    console.log('\n🔑 테스트용 계정 정보:');
    console.log(`- 이메일: ${TEST_USER_EMAIL}`);
    console.log(`- 비밀번호: ${TEST_USER_PASSWORD}`);
    console.log(`- 클라이언트 ID: ${TEST_CLIENT_ID}`);
    console.log(`- 클라이언트 시크릿: ${TEST_CLIENT_SECRET}`);
  } catch (error) {
    console.error('❌ 더미데이터 생성 중 오류 발생:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 실행
if (require.main === module) {
  generateMassiveDummyData()
    .then(() => {
      console.log('✅ 스크립트 실행 완료');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 스크립트 실행 실패:', error);
      process.exit(1);
    });
}

export {
  generateMassiveDummyData,
  TEST_USER_EMAIL,
  TEST_USER_PASSWORD,
  TEST_CLIENT_ID,
  TEST_CLIENT_SECRET,
};
