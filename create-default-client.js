const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createDefaultClient() {
  try {
    console.log('🔄 Default Client 생성 중...');

    // 기존 default client가 있는지 확인
    const existingClient = await prisma.client.findUnique({
      where: { id: 'default' },
    });

    if (existingClient) {
      console.log('✅ Default Client가 이미 존재합니다.');
      return;
    }

    // Default Client 생성
    const defaultClient = await prisma.client.create({
      data: {
        id: 'default',
        name: 'Default Client',
        clientId: 'default',
        redirectUris: '[]',
        grantTypes: '[]',
        responseTypes: '[]',
        scopes: 'read write',
        isConfidential: false,
        isFirstParty: true,
        isActive: true,
        isRootClient: true,
      },
    });

    console.log('✅ Default Client 생성 완료:', defaultClient.id);
  } catch (error) {
    console.error('❌ Default Client 생성 실패:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createDefaultClient();
