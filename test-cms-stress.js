// stress test for CMS API
const axios = require('axios');
const { faker } = require('@faker-js/faker');
const BASE_URL = 'http://localhost:3000';

const CONCURRENCY = 10; // 동시 요청 수
const TOTAL_ROUNDS = 1000; // 반복 라운드 수 (CONCURRENCY * TOTAL_ROUNDS = 1만회)

let stats = {
  total: 0,
  success: 0,
  fail: 0,
  errorTypes: {},
};

function logResult(success, type, msg) {
  stats.total++;
  if (success) {
    stats.success++;
  } else {
    stats.fail++;
    stats.errorTypes[type] = (stats.errorTypes[type] || 0) + 1;
    if (stats.fail <= 10) console.log('❌', type, msg);
  }
}

async function makeRequest(method, url, data = null, headers = {}) {
  try {
    const response = await axios({
      method,
      url: BASE_URL + url,
      data,
      headers,
      validateStatus: () => true,
    });
    if (response.status >= 200 && response.status < 300) {
      return { success: true, data: response.data, status: response.status };
    } else {
      return { success: false, error: response.data, status: response.status };
    }
  } catch (e) {
    return { success: false, error: e.message, status: 0 };
  }
}

function randomAction() {
  // 액션 종류: 회원가입, 로그인, 토큰갱신, 카테고리/태그/게시글 CRUD, 인증실패 등
  const actions = [
    'register',
    'login',
    'refresh',
    'category_create',
    'category_read',
    'category_update',
    'category_delete',
    'tag_create',
    'tag_read',
    'tag_update',
    'tag_delete',
    'post_create',
    'post_read',
    'post_update',
    'post_delete',
    'auth_fail',
  ];
  return actions[Math.floor(Math.random() * actions.length)];
}

async function runOneTest() {
  // 1. 랜덤 유저 생성 및 로그인
  const email = faker.internet.email();
  const name = faker.internet.userName();
  const password = 'Test1234!';
  let accessToken = null;
  let refreshToken = null;
  let userId = null;
  // 회원가입
  let res = await makeRequest('POST', '/auth/register', {
    email,
    name,
    password,
  });
  if (!res.success)
    return logResult(false, 'register', res.error?.message || '회원가입 실패');
  userId = res.data.id;
  // 로그인
  res = await makeRequest('POST', '/auth/login', { username: name, password });
  if (!res.success)
    return logResult(false, 'login', res.error?.message || '로그인 실패');
  accessToken = res.data.accessToken;
  refreshToken = res.data.refreshToken;

  // 2. 랜덤하게 여러 CMS 액션 수행
  let categoryId = null,
    tagId = null,
    postId = null;
  for (let i = 0; i < 3; ++i) {
    const action = randomAction();
    try {
      switch (action) {
        case 'refresh': {
          const r = await makeRequest('POST', '/auth/refresh', {
            refreshToken,
          });
          if (r.success) {
            accessToken = r.data.accessToken;
            refreshToken = r.data.refreshToken;
            logResult(true, 'refresh');
          } else {
            logResult(false, 'refresh', r.error?.message);
          }
          break;
        }
        case 'category_create': {
          const r = await makeRequest(
            'POST',
            '/cms/categories',
            {
              name: faker.commerce.department(),
              slug: faker.helpers.slugify(faker.commerce.department()),
              description: faker.lorem.sentence(),
              order: 1,
              isActive: true,
            },
            { Authorization: `Bearer ${accessToken}` },
          );
          if (r.success) {
            categoryId = r.data.id;
            logResult(true, 'category_create');
          } else {
            logResult(false, 'category_create', r.error?.message);
          }
          break;
        }
        case 'category_read': {
          if (!categoryId) break;
          const r = await makeRequest(
            'GET',
            `/cms/categories/${categoryId}`,
            null,
            { Authorization: `Bearer ${accessToken}` },
          );
          logResult(r.success, 'category_read', r.error?.message);
          break;
        }
        case 'category_update': {
          if (!categoryId) break;
          const r = await makeRequest(
            'PATCH',
            `/cms/categories/${categoryId}`,
            {
              name: faker.commerce.department(),
              description: faker.lorem.sentence(),
            },
            { Authorization: `Bearer ${accessToken}` },
          );
          logResult(r.success, 'category_update', r.error?.message);
          break;
        }
        case 'category_delete': {
          if (!categoryId) break;
          const r = await makeRequest(
            'DELETE',
            `/cms/categories/${categoryId}`,
            null,
            { Authorization: `Bearer ${accessToken}` },
          );
          logResult(r.success, 'category_delete', r.error?.message);
          categoryId = null;
          break;
        }
        case 'tag_create': {
          const r = await makeRequest(
            'POST',
            '/cms/tags',
            {
              name: faker.commerce.productAdjective(),
              slug: faker.helpers.slugify(faker.commerce.productAdjective()),
              description: faker.lorem.sentence(),
            },
            { Authorization: `Bearer ${accessToken}` },
          );
          if (r.success) {
            tagId = r.data.id;
            logResult(true, 'tag_create');
          } else {
            logResult(false, 'tag_create', r.error?.message);
          }
          break;
        }
        case 'tag_read': {
          if (!tagId) break;
          const r = await makeRequest('GET', `/cms/tags/${tagId}`, null, {
            Authorization: `Bearer ${accessToken}`,
          });
          logResult(r.success, 'tag_read', r.error?.message);
          break;
        }
        case 'tag_update': {
          if (!tagId) break;
          const r = await makeRequest(
            'PATCH',
            `/cms/tags/${tagId}`,
            {
              name: faker.commerce.productAdjective(),
              description: faker.lorem.sentence(),
            },
            { Authorization: `Bearer ${accessToken}` },
          );
          logResult(r.success, 'tag_update', r.error?.message);
          break;
        }
        case 'tag_delete': {
          if (!tagId) break;
          const r = await makeRequest('DELETE', `/cms/tags/${tagId}`, null, {
            Authorization: `Bearer ${accessToken}`,
          });
          logResult(r.success, 'tag_delete', r.error?.message);
          tagId = null;
          break;
        }
        case 'post_create': {
          if (!categoryId || !tagId) break;
          const r = await makeRequest(
            'POST',
            '/cms/posts',
            {
              title: faker.lorem.words(3),
              slug: faker.helpers.slugify(faker.lorem.words(3)),
              content: faker.lorem.paragraph(),
              excerpt: faker.lorem.sentence(),
              status: 'PUBLISHED',
              categoryId,
              tagIds: [tagId],
              isSticky: false,
              isCommentable: true,
              metaTitle: faker.lorem.words(2),
              metaDescription: faker.lorem.sentence(),
            },
            { Authorization: `Bearer ${accessToken}` },
          );
          if (r.success) {
            postId = r.data.id;
            logResult(true, 'post_create');
          } else {
            logResult(false, 'post_create', r.error?.message);
          }
          break;
        }
        case 'post_read': {
          if (!postId) break;
          const r = await makeRequest('GET', `/cms/posts/${postId}`, null, {
            Authorization: `Bearer ${accessToken}`,
          });
          logResult(r.success, 'post_read', r.error?.message);
          break;
        }
        case 'post_update': {
          if (!postId) break;
          const r = await makeRequest(
            'PATCH',
            `/cms/posts/${postId}`,
            {
              title: faker.lorem.words(3),
              content: faker.lorem.paragraph(),
              status: 'PUBLISHED',
            },
            { Authorization: `Bearer ${accessToken}` },
          );
          logResult(r.success, 'post_update', r.error?.message);
          break;
        }
        case 'post_delete': {
          if (!postId) break;
          const r = await makeRequest('DELETE', `/cms/posts/${postId}`, null, {
            Authorization: `Bearer ${accessToken}`,
          });
          logResult(r.success, 'post_delete', r.error?.message);
          postId = null;
          break;
        }
        case 'auth_fail': {
          // 잘못된 토큰으로 요청
          const r = await makeRequest('GET', '/cms/categories', null, {
            Authorization: 'Bearer wrongtoken',
          });
          logResult(
            !r.success && r.status === 401,
            'auth_fail',
            r.error?.message,
          );
          break;
        }
        default: {
          // 기타: 토큰 없이 요청
          const r = await makeRequest('GET', '/cms/categories');
          logResult(
            !r.success && r.status === 401,
            'no_token',
            r.error?.message,
          );
        }
      }
    } catch (e) {
      logResult(false, action, e.message);
    }
  }

  // 3. 생성된 데이터 정리(삭제)
  if (postId)
    await makeRequest('DELETE', `/cms/posts/${postId}`, null, {
      Authorization: `Bearer ${accessToken}`,
    });
  if (tagId)
    await makeRequest('DELETE', `/cms/tags/${tagId}`, null, {
      Authorization: `Bearer ${accessToken}`,
    });
  if (categoryId)
    await makeRequest('DELETE', `/cms/categories/${categoryId}`, null, {
      Authorization: `Bearer ${accessToken}`,
    });
  // 유저 삭제는 생략(테스트 계정만 생성)
}

async function main() {
  console.log('🔬 CMS 스트레스 테스트 시작');
  for (let round = 1; round <= TOTAL_ROUNDS; ++round) {
    const promises = [];
    for (let i = 0; i < CONCURRENCY; ++i) {
      promises.push(runOneTest());
    }
    await Promise.all(promises);
    if (round % 50 === 0) {
      console.log(
        `진행률: ${round * CONCURRENCY}회 / ${TOTAL_ROUNDS * CONCURRENCY}회`,
      );
    }
  }
  console.log('\n=== 테스트 결과 ===');
  console.log('총 요청:', stats.total);
  console.log('성공:', stats.success);
  console.log('실패:', stats.fail);
  console.log('에러 유형별:', stats.errorTypes);
}

main();
