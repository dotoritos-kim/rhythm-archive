import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    // raw 쿼리로 테이블 목록 조회
    const tables = await prisma.$queryRawUnsafe<any[]>('SHOW TABLES;');
    console.log('테이블 목록:', tables);
  } catch (err) {
    console.error('DB 접속/조회 오류:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
