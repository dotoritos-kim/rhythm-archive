import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addFullTextIndexes() {
  try {
    console.log('🔍 FULLTEXT 인덱스 추가 시작...');

    // 먼저 기존 FULLTEXT 인덱스 확인
    console.log('\n📊 현재 FULLTEXT 인덱스 확인:');

    try {
      const songIndexes = await prisma.$queryRaw`
        SHOW INDEX FROM songs WHERE Key_name LIKE '%fulltext%'
      `;
      console.log('songs 테이블 FULLTEXT 인덱스:', songIndexes);
    } catch (error) {
      console.log('songs 테이블 FULLTEXT 인덱스 없음');
    }

    try {
      const composerIndexes = await prisma.$queryRaw`
        SHOW INDEX FROM composers WHERE Key_name LIKE '%fulltext%'
      `;
      console.log('composers 테이블 FULLTEXT 인덱스:', composerIndexes);
    } catch (error) {
      console.log('composers 테이블 FULLTEXT 인덱스 없음');
    }

    try {
      const gameIndexes = await prisma.$queryRaw`
        SHOW INDEX FROM games WHERE Key_name LIKE '%fulltext%'
      `;
      console.log('games 테이블 FULLTEXT 인덱스:', gameIndexes);
    } catch (error) {
      console.log('games 테이블 FULLTEXT 인덱스 없음');
    }

    // songs 테이블에 FULLTEXT 인덱스 추가 (실제 컬럼명 사용)
    console.log('\n📝 songs 테이블에 FULLTEXT 인덱스 추가 중...');
    await prisma.$executeRaw`
      ALTER TABLE songs 
      ADD FULLTEXT INDEX idx_songs_fulltext (title, original_title)
    `;
    console.log('✅ songs 테이블 FULLTEXT 인덱스 추가 완료');

    // composers 테이블에 FULLTEXT 인덱스 추가
    console.log('🎼 composers 테이블에 FULLTEXT 인덱스 추가 중...');
    await prisma.$executeRaw`
      ALTER TABLE composers 
      ADD FULLTEXT INDEX idx_composers_fulltext (name, company_name)
    `;
    console.log('✅ composers 테이블 FULLTEXT 인덱스 추가 완료');

    // games 테이블에 FULLTEXT 인덱스 추가
    console.log('🎮 games 테이블에 FULLTEXT 인덱스 추가 중...');
    await prisma.$executeRaw`
      ALTER TABLE games 
      ADD FULLTEXT INDEX idx_games_fulltext (name, publisher)
    `;
    console.log('✅ games 테이블 FULLTEXT 인덱스 추가 완료');

    // dlcs 테이블에 FULLTEXT 인덱스 추가
    console.log('📦 dlcs 테이블에 FULLTEXT 인덱스 추가 중...');
    await prisma.$executeRaw`
      ALTER TABLE dlcs 
      ADD FULLTEXT INDEX idx_dlcs_fulltext (dlc_name)
    `;
    console.log('✅ dlcs 테이블 FULLTEXT 인덱스 추가 완료');

    // courses 테이블에 FULLTEXT 인덱스 추가
    console.log('🏁 courses 테이블에 FULLTEXT 인덱스 추가 중...');
    await prisma.$executeRaw`
      ALTER TABLE courses 
      ADD FULLTEXT INDEX idx_courses_fulltext (course_name)
    `;
    console.log('✅ courses 테이블 FULLTEXT 인덱스 추가 완료');

    // tags 테이블에 FULLTEXT 인덱스 추가
    console.log('🏷️ tags 테이블에 FULLTEXT 인덱스 추가 중...');
    await prisma.$executeRaw`
      ALTER TABLE tags 
      ADD FULLTEXT INDEX idx_tags_fulltext (name)
    `;
    console.log('✅ tags 테이블 FULLTEXT 인덱스 추가 완료');

    // song_game_versions 테이블에 FULLTEXT 인덱스 추가
    console.log('🎵 song_game_versions 테이블에 FULLTEXT 인덱스 추가 중...');
    await prisma.$executeRaw`
      ALTER TABLE song_game_versions 
      ADD FULLTEXT INDEX idx_sgv_fulltext (in_game_title, arrangement)
    `;
    console.log('✅ song_game_versions 테이블 FULLTEXT 인덱스 추가 완료');

    // charts 테이블에 FULLTEXT 인덱스 추가
    console.log('📊 charts 테이블에 FULLTEXT 인덱스 추가 중...');
    await prisma.$executeRaw`
      ALTER TABLE charts 
      ADD FULLTEXT INDEX idx_charts_fulltext (difficulty_name)
    `;
    console.log('✅ charts 테이블 FULLTEXT 인덱스 추가 완료');

    console.log('\n🎉 모든 FULLTEXT 인덱스 추가 완료!');

    // 인덱스 확인
    console.log('\n📊 추가된 FULLTEXT 인덱스 확인:');

    const songIndexes = await prisma.$queryRaw`
      SHOW INDEX FROM songs WHERE Key_name LIKE '%fulltext%'
    `;
    console.log('songs 테이블 FULLTEXT 인덱스:', songIndexes);

    const composerIndexes = await prisma.$queryRaw`
      SHOW INDEX FROM composers WHERE Key_name LIKE '%fulltext%'
    `;
    console.log('composers 테이블 FULLTEXT 인덱스:', composerIndexes);

    const gameIndexes = await prisma.$queryRaw`
      SHOW INDEX FROM games WHERE Key_name LIKE '%fulltext%'
    `;
    console.log('games 테이블 FULLTEXT 인덱스:', gameIndexes);
  } catch (error) {
    console.error('❌ FULLTEXT 인덱스 추가 실패:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addFullTextIndexes();
