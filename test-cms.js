const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
let accessToken = '';
let refreshToken = '';

// 랜덤 이메일/유저명 생성
const randomSuffix = Math.random().toString(36).substring(2, 10);
const testEmail = `test+${randomSuffix}@example.com`;
const testUsername = `testuser_${randomSuffix}`;

// 테스트 결과를 저장할 객체
const testResults = {
  passed: 0,
  failed: 0,
  tests: [],
};

// 테스트 헬퍼 함수
function logTest(name, success, message = '') {
  const status = success ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} ${name}${message ? ': ' + message : ''}`);

  testResults.tests.push({ name, success, message });
  if (success) {
    testResults.passed++;
  } else {
    testResults.failed++;
  }
}

// API 요청 헬퍼 함수
async function makeRequest(method, url, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status,
    };
  }
}

// 테스트 시작 전 cleanup: 같은 이메일 계정 있으면 삭제
async function cleanupTestUser() {
  try {
    // 1. 로그인 시도 (존재하면 토큰 획득)
    const loginResult = await makeRequest('POST', '/auth/login', {
      email: testEmail,
      password: 'password123',
    });
    if (loginResult.success && loginResult.data && loginResult.data.user) {
      // 2. 토큰으로 유저 삭제 (관리자 API가 없으면 skip)
      // 실제 서비스에서는 별도 삭제 API 필요
      console.log('⚠️ 기존 테스트 계정이 존재합니다. 수동 삭제 필요!');
    }
  } catch (e) {
    // 무시
  }
}

// 1. 사용자 가입 테스트
async function testUserRegistration() {
  console.log('\n=== 사용자 가입 테스트 ===');

  const userData = {
    username: testUsername,
    email: testEmail,
    password: 'password123',
    name: testUsername,
  };

  const result = await makeRequest('POST', '/auth/register', userData);

  if (result.success && result.status === 201) {
    logTest('사용자 가입', true, `사용자 ID: ${result.data.id}`);
    return result.data;
  } else {
    logTest('사용자 가입', false, result.error?.message || '가입 실패');
    return null;
  }
}

// 2. JWT 로그인 테스트
async function testJwtLogin() {
  console.log('\n=== JWT 로그인 테스트 ===');

  const loginData = {
    email: testEmail,
    password: 'password123',
  };

  const result = await makeRequest('POST', '/auth/login', loginData);

  if (result.success && (result.status === 200 || result.status === 201)) {
    accessToken = result.data.accessToken;
    refreshToken = result.data.refreshToken;
    logTest(
      'JWT 로그인',
      true,
      `Access Token: ${accessToken.substring(0, 20)}...`,
    );
    // refreshToken DB 저장 여부 진단
    await checkRefreshTokenInDb(refreshToken);
    return true;
  } else {
    logTest('JWT 로그인', false, result.error?.message || '로그인 실패');
    console.error('로그인 에러 상세:', result);
    return false;
  }
}

// refreshToken DB 저장 여부 진단
async function checkRefreshTokenInDb(token) {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const found = await prisma.refreshToken.findFirst({ where: { token } });
    if (found) {
      console.log(
        '✅ [진단] refreshToken DB 저장 확인:',
        found.id,
        found.isRevoked,
        found.expiresAt,
      );
    } else {
      console.log('❌ [진단] refreshToken DB에 없음');
    }
    await prisma.$disconnect();
  } catch (e) {
    console.log('❌ [진단] refreshToken DB 조회 실패:', e.message);
  }
}

// 3. 토큰 갱신 테스트
async function testTokenRefresh() {
  console.log('\n=== 토큰 갱신 테스트 ===');
  console.log('[진단] refreshToken 요청값:', refreshToken);
  // refreshToken payload 직접 decode
  try {
    const payload = JSON.parse(
      Buffer.from(refreshToken.split('.')[1], 'base64').toString(),
    );
    console.log('[진단] refreshToken payload(디코드):', payload);
  } catch (e) {
    console.log('[진단] refreshToken payload 디코드 실패:', e.message);
  }

  const result = await makeRequest('POST', '/auth/refresh', {
    refreshToken: refreshToken,
  });

  console.log('[진단] 토큰 갱신 응답:', result);

  if (result.success && (result.status === 200 || result.status === 201)) {
    accessToken = result.data.accessToken;
    refreshToken = result.data.refreshToken;
    logTest(
      '토큰 갱신',
      true,
      `새 Access Token: ${accessToken.substring(0, 20)}...`,
    );
    return true;
  } else {
    logTest('토큰 갱신', false, result.error?.message || '토큰 갱신 실패');
    return false;
  }
}

// 4. 카테고리 CRUD 테스트
async function testCategoryCRUD() {
  console.log('\n=== 카테고리 CRUD 테스트 ===');

  // 카테고리 생성
  const categoryData = {
    name: '테스트 카테고리',
    slug: 'test-category',
    description: '테스트용 카테고리입니다.',
    order: 1,
    isActive: true,
  };

  let result = await makeRequest('POST', '/cms/categories', categoryData, {
    Authorization: `Bearer ${accessToken}`,
  });

  if (!result.success) {
    logTest('카테고리 생성', false, result.error?.message || '생성 실패');
    return null;
  }

  const categoryId = result.data.id;
  logTest('카테고리 생성', true, `카테고리 ID: ${categoryId}`);

  // 카테고리 조회
  result = await makeRequest('GET', `/cms/categories/${categoryId}`, null, {
    Authorization: `Bearer ${accessToken}`,
  });

  if (result.success) {
    logTest('카테고리 조회', true, `카테고리명: ${result.data.name}`);
  } else {
    logTest('카테고리 조회', false, result.error?.message || '조회 실패');
  }

  // 카테고리 수정
  const updateData = {
    name: '수정된 테스트 카테고리',
    description: '수정된 설명입니다.',
  };

  result = await makeRequest(
    'PATCH',
    `/cms/categories/${categoryId}`,
    updateData,
    {
      Authorization: `Bearer ${accessToken}`,
    },
  );

  if (result.success) {
    logTest('카테고리 수정', true, `수정된 이름: ${result.data.name}`);
  } else {
    logTest('카테고리 수정', false, result.error?.message || '수정 실패');
  }

  return categoryId;
}

// 5. 태그 CRUD 테스트
async function testTagCRUD() {
  console.log('\n=== 태그 CRUD 테스트 ===');

  // 태그 생성
  const tagData = {
    name: '테스트 태그',
    slug: 'test-tag',
    description: '테스트용 태그입니다.',
  };

  let result = await makeRequest('POST', '/cms/tags', tagData, {
    Authorization: `Bearer ${accessToken}`,
  });

  if (!result.success) {
    logTest('태그 생성', false, result.error?.message || '생성 실패');
    return null;
  }

  const tagId = result.data.id;
  logTest('태그 생성', true, `태그 ID: ${tagId}`);

  // 태그 조회
  result = await makeRequest('GET', `/cms/tags/${tagId}`, null, {
    Authorization: `Bearer ${accessToken}`,
  });

  if (result.success) {
    logTest('태그 조회', true, `태그명: ${result.data.name}`);
  } else {
    logTest('태그 조회', false, result.error?.message || '조회 실패');
  }

  // 태그 수정
  const updateData = {
    name: '수정된 테스트 태그',
    description: '수정된 태그 설명입니다.',
  };

  result = await makeRequest('PATCH', `/cms/tags/${tagId}`, updateData, {
    Authorization: `Bearer ${accessToken}`,
  });

  if (result.success) {
    logTest('태그 수정', true, `수정된 이름: ${result.data.name}`);
  } else {
    logTest('태그 수정', false, result.error?.message || '수정 실패');
  }

  return tagId;
}

// 6. 게시글 CRUD 테스트
async function testPostCRUD(categoryId, tagId) {
  console.log('\n=== 게시글 CRUD 테스트 ===');

  // 게시글 생성
  const postData = {
    title: '테스트 게시글',
    slug: 'test-post',
    content: '이것은 테스트 게시글의 내용입니다.',
    excerpt: '테스트 게시글 요약',
    status: 'PUBLISHED',
    categoryId: categoryId,
    tagIds: [tagId],
    isSticky: false,
    isCommentable: true,
    metaTitle: 'SEO 제목',
    metaDescription: 'SEO 설명',
  };

  let result = await makeRequest('POST', '/cms/posts', postData, {
    Authorization: `Bearer ${accessToken}`,
  });

  if (!result.success) {
    logTest('게시글 생성', false, result.error?.message || '생성 실패');
    return null;
  }

  const postId = result.data.id;
  logTest('게시글 생성', true, `게시글 ID: ${postId}`);

  // 게시글 조회
  result = await makeRequest('GET', `/cms/posts/${postId}`, null, {
    Authorization: `Bearer ${accessToken}`,
  });

  if (result.success) {
    logTest('게시글 조회', true, `게시글 제목: ${result.data.title}`);
  } else {
    logTest('게시글 조회', false, result.error?.message || '조회 실패');
  }

  // 게시글 수정
  const updateData = {
    title: '수정된 테스트 게시글',
    content: '수정된 게시글 내용입니다.',
    status: 'PUBLISHED',
  };

  result = await makeRequest('PATCH', `/cms/posts/${postId}`, updateData, {
    Authorization: `Bearer ${accessToken}`,
  });

  if (result.success) {
    logTest('게시글 수정', true, `수정된 제목: ${result.data.title}`);
  } else {
    logTest('게시글 수정', false, result.error?.message || '수정 실패');
  }

  return postId;
}

// 7. 첨부파일 업로드 테스트
async function testFileUpload() {
  console.log('\n=== 첨부파일 업로드 테스트 ===');

  // 간단한 텍스트 파일 생성
  const FormData = require('form-data');
  const fs = require('fs');

  // 테스트 파일 생성
  const testFilePath = './test-file.txt';
  fs.writeFileSync(testFilePath, 'This is a test file content');

  try {
    const form = new FormData();
    form.append('file', fs.createReadStream(testFilePath));

    const response = await axios.post(
      `${BASE_URL}/cms/attachments/upload`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (response.status === 201) {
      logTest('파일 업로드', true, `파일 ID: ${response.data.id}`);

      // 업로드된 파일 조회
      const getResult = await makeRequest(
        'GET',
        `/cms/attachments/${response.data.id}`,
      );

      if (getResult.success) {
        logTest('파일 조회', true, `파일명: ${getResult.data.filename}`);
      } else {
        logTest('파일 조회', false, getResult.error?.message || '조회 실패');
      }

      // 테스트 파일 삭제
      fs.unlinkSync(testFilePath);

      return response.data.id;
    } else {
      logTest('파일 업로드', false, '업로드 실패');
      return null;
    }
  } catch (error) {
    logTest(
      '파일 업로드',
      false,
      error.response?.data?.message || error.message,
    );
    return null;
  }
}

// 8. 목록 조회 테스트
async function testListQueries() {
  console.log('\n=== 목록 조회 테스트 ===');

  // 카테고리 목록 조회
  let result = await makeRequest('GET', '/cms/categories', null, {
    Authorization: `Bearer ${accessToken}`,
  });

  if (result.success) {
    logTest('카테고리 목록 조회', true, `총 ${result.data.length}개 카테고리`);
  } else {
    logTest('카테고리 목록 조회', false, result.error?.message || '조회 실패');
  }

  // 태그 목록 조회
  result = await makeRequest('GET', '/cms/tags', null, {
    Authorization: `Bearer ${accessToken}`,
  });

  if (result.success) {
    logTest('태그 목록 조회', true, `총 ${result.data.length}개 태그`);
  } else {
    logTest('태그 목록 조회', false, result.error?.message || '조회 실패');
  }

  // 게시글 목록 조회
  result = await makeRequest('GET', '/cms/posts', null, {
    Authorization: `Bearer ${accessToken}`,
  });

  if (result.success) {
    logTest('게시글 목록 조회', true, `총 ${result.data.length}개 게시글`);
  } else {
    logTest('게시글 목록 조회', false, result.error?.message || '조회 실패');
  }
}

// 9. 인증 실패 테스트
async function testAuthFailure() {
  console.log('\n=== 인증 실패 테스트 ===');

  // 1. 완전히 잘못된 토큰
  console.log('[진단] 테스트 1: 완전히 잘못된 토큰');
  let result = await makeRequest('GET', '/cms/categories', null, {
    Authorization: 'Bearer invalid-token',
  });
  console.log('[진단] 잘못된 토큰 응답:', result);

  if (!result.success && result.status === 401) {
    logTest('잘못된 토큰 거부', true, '401 Unauthorized 응답');
  } else {
    logTest(
      '잘못된 토큰 거부',
      false,
      `예상과 다른 응답: ${result.status} - ${result.error?.message || '알 수 없는 오류'}`,
    );
  }

  // 2. 만료된 토큰 (과거 시간으로 생성)
  console.log('[진단] 테스트 2: 만료된 토큰');
  const jwt = require('jsonwebtoken');
  const expiredToken = jwt.sign(
    {
      sub: 'test-user-id',
      email: 'test@example.com',
      iat: Math.floor(Date.now() / 1000) - 3600, // 1시간 전
      exp: Math.floor(Date.now() / 1000) - 1800, // 30분 전 만료
    },
    process.env.JWT_SECRET || 'dev-secret',
  );

  result = await makeRequest('GET', '/cms/categories', null, {
    Authorization: `Bearer ${expiredToken}`,
  });
  console.log('[진단] 만료된 토큰 응답:', result);

  if (!result.success && result.status === 401) {
    logTest('만료된 토큰 거부', true, '401 Unauthorized 응답');
  } else {
    logTest(
      '만료된 토큰 거부',
      false,
      `예상과 다른 응답: ${result.status} - ${result.error?.message || '알 수 없는 오류'}`,
    );
  }

  // 3. 토큰 없이 요청
  console.log('[진단] 테스트 3: 토큰 없이 요청');
  result = await makeRequest('GET', '/cms/categories', null, {});
  console.log('[진단] 토큰 없음 응답:', result);

  if (!result.success && result.status === 401) {
    logTest('토큰 없음 거부', true, '401 Unauthorized 응답');
  } else {
    logTest(
      '토큰 없음 거부',
      false,
      `예상과 다른 응답: ${result.status} - ${result.error?.message || '알 수 없는 오류'}`,
    );
  }
}

// 10. 정리 테스트
async function testCleanup(postId, categoryId, tagId) {
  console.log('\n=== 정리 테스트 ===');

  // 게시글 삭제
  if (postId) {
    const result = await makeRequest('DELETE', `/cms/posts/${postId}`, null, {
      Authorization: `Bearer ${accessToken}`,
    });

    if (result.success) {
      logTest('게시글 삭제', true);
    } else {
      logTest('게시글 삭제', false, result.error?.message || '삭제 실패');
    }
  }

  // 태그 삭제
  if (tagId) {
    const result = await makeRequest('DELETE', `/cms/tags/${tagId}`, null, {
      Authorization: `Bearer ${accessToken}`,
    });

    if (result.success) {
      logTest('태그 삭제', true);
    } else {
      logTest('태그 삭제', false, result.error?.message || '삭제 실패');
    }
  }

  // 카테고리 삭제
  if (categoryId) {
    const result = await makeRequest(
      'DELETE',
      `/cms/categories/${categoryId}`,
      null,
      {
        Authorization: `Bearer ${accessToken}`,
      },
    );

    if (result.success) {
      logTest('카테고리 삭제', true);
    } else {
      logTest('카테고리 삭제', false, result.error?.message || '삭제 실패');
    }
  }
}

// 메인 테스트 실행 함수
async function runAllTests() {
  console.log('🚀 CMS 기능 테스트 시작');
  console.log(`📡 서버 URL: ${BASE_URL}`);

  try {
    // 1. 사용자 가입
    const user = await testUserRegistration();

    // 2. JWT 로그인
    const loginSuccess = await testJwtLogin();
    if (!loginSuccess) {
      console.log('❌ 로그인 실패로 인해 테스트를 중단합니다.');
      return;
    }

    // 3. 토큰 갱신
    await testTokenRefresh();

    // 4. 카테고리 CRUD
    const categoryId = await testCategoryCRUD();

    // 5. 태그 CRUD
    const tagId = await testTagCRUD();

    // 6. 게시글 CRUD
    const postId = await testPostCRUD(categoryId, tagId);

    // 7. 파일 업로드
    await testFileUpload();

    // 8. 목록 조회
    await testListQueries();

    // 9. 인증 실패 테스트
    await testAuthFailure();

    // 10. 정리
    await testCleanup(postId, categoryId, tagId);
  } catch (error) {
    console.error('❌ 테스트 실행 중 오류 발생:', error.message);
  }

  // 테스트 결과 요약
  console.log('\n📊 테스트 결과 요약');
  console.log(`✅ 성공: ${testResults.passed}`);
  console.log(`❌ 실패: ${testResults.failed}`);
  console.log(
    `📈 성공률: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`,
  );

  if (testResults.failed > 0) {
    console.log('\n❌ 실패한 테스트:');
    testResults.tests
      .filter((test) => !test.success)
      .forEach((test) => console.log(`  - ${test.name}: ${test.message}`));
  }

  console.log('\n🎉 CMS 기능 테스트 완료!');
}

// 서버 연결 확인
async function checkServerConnection() {
  try {
    const response = await axios.get(`${BASE_URL}/`, { timeout: 5000 });
    if (response.status === 200) {
      console.log('✅ 서버 연결 성공');
      return true;
    }
  } catch (error) {
    console.log('❌ 서버 연결 실패. 서버가 실행 중인지 확인해주세요.');
    console.log('💡 npm run start:dev 명령어로 서버를 시작하세요.');
    return false;
  }
}

// 테스트 실행
async function main() {
  await cleanupTestUser();
  const serverConnected = await checkServerConnection();
  if (serverConnected) {
    await runAllTests();
  }
}

main().catch(console.error);
