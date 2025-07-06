/* ====================================================================
   0. 세션 설정
   ==================================================================== */
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

/* (선택) 한글 2글자 토큰까지 색인하려면 root 로 1회만:
   -- SET GLOBAL innodb_ft_min_token_size = 2;  서버 재시작
*/

/* ====================================================================
   1. 스키마 초기화
   ==================================================================== */
DROP DATABASE IF EXISTS rhythmdb;
CREATE DATABASE rhythmdb
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE rhythmdb;

/* ====================================================================
   3. 테이블 정의 (14개)
   ==================================================================== */

/* ── songs ── */
CREATE TABLE songs (
  id CHAR(32) NOT NULL PRIMARY KEY,
  title           VARCHAR(255) NOT NULL,
  original_title  VARCHAR(255),
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                          ON UPDATE CURRENT_TIMESTAMP(3),
  deletedAt DATETIME(3),
  UNIQUE KEY uq_songs_title(title),
  FULLTEXT KEY ft_songs_title(title, original_title) WITH PARSER ngram
) ENGINE=InnoDB;

/* ── song_infos ── */
CREATE TABLE song_infos (
  id CHAR(32) NOT NULL PRIMARY KEY,
  song_id    CHAR(32) NOT NULL,
  bpm        DECIMAL(6,2),
  beat       VARCHAR(32),
  length_sec INT,
  extra      JSON,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                          ON UPDATE CURRENT_TIMESTAMP(3),
  deletedAt DATETIME(3),
  UNIQUE KEY uq_song_infos_song(song_id),
  FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
) ENGINE=InnoDB;

/* ── composers ── */
CREATE TABLE composers (
  id CHAR(32) NOT NULL PRIMARY KEY,
  name         VARCHAR(255) NOT NULL,
  company_name VARCHAR(255),
  extra        JSON,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                          ON UPDATE CURRENT_TIMESTAMP(3),
  deletedAt DATETIME(3),
  UNIQUE KEY uq_composer_name_company(name, company_name),
  FULLTEXT KEY ft_composers(name, company_name) WITH PARSER ngram
) ENGINE=InnoDB;

/* ── song_composers ── */
CREATE TABLE song_composers (
  id CHAR(32) NOT NULL PRIMARY KEY,
  song_id     CHAR(32) NOT NULL,
  composer_id CHAR(32) NOT NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                          ON UPDATE CURRENT_TIMESTAMP(3),
  deletedAt DATETIME(3),
  UNIQUE KEY uq_sc(song_id, composer_id),
  INDEX idx_sc_comp(composer_id),
  FOREIGN KEY (song_id)     REFERENCES songs(id)     ON DELETE CASCADE,
  FOREIGN KEY (composer_id) REFERENCES composers(id) ON DELETE CASCADE
) ENGINE=InnoDB;

/* ── games ── */
CREATE TABLE games (
  id CHAR(32) NOT NULL PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  release_date  DATE,
  publisher     VARCHAR(255),
  extra         JSON,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                          ON UPDATE CURRENT_TIMESTAMP(3),
  deletedAt DATETIME(3),
  UNIQUE KEY uq_games_name(name),
  FULLTEXT KEY ft_games_name(name) WITH PARSER ngram
) ENGINE=InnoDB;

/* ── dlcs ── */
CREATE TABLE dlcs (
  id CHAR(32) NOT NULL PRIMARY KEY,
  game_id  CHAR(32) NOT NULL,
  dlc_name VARCHAR(255) NOT NULL,
  release_date DATE,
  extra JSON,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                          ON UPDATE CURRENT_TIMESTAMP(3),
  deletedAt DATETIME(3),
  UNIQUE KEY uq_dlcs(game_id, dlc_name),
  FULLTEXT KEY ft_dlcs_name(dlc_name) WITH PARSER ngram,
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
) ENGINE=InnoDB;

/* ── song_game_versions ── */
CREATE TABLE song_game_versions (
  id CHAR(32) NOT NULL PRIMARY KEY,
  song_id CHAR(32) NOT NULL,
  game_id CHAR(32) NOT NULL,
  dlc_id  CHAR(32),
  in_game_title VARCHAR(255),
  bpm_override  DECIMAL(6,2),
  length_sec INT,
  arrangement VARCHAR(128),
  first_version VARCHAR(255),
  first_date DATE,
  extra JSON,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                          ON UPDATE CURRENT_TIMESTAMP(3),
  deletedAt DATETIME(3),
  UNIQUE KEY uq_sgv(song_id, game_id, dlc_id, in_game_title),
  INDEX idx_sgv_game(game_id),
  INDEX idx_sgv_dlc(dlc_id),
  FULLTEXT KEY ft_sgv(in_game_title, arrangement) WITH PARSER ngram,
  FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE,
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY (dlc_id)  REFERENCES dlcs(id) ON DELETE SET NULL
) ENGINE=InnoDB;

/* ── charts ── */
CREATE TABLE charts (
  id CHAR(32) NOT NULL PRIMARY KEY,
  sgv_id CHAR(32) NOT NULL,
  difficulty_name VARCHAR(64) NOT NULL,
  level DECIMAL(4,2),
  note_count INT,
  chart_type VARCHAR(64),
  extra JSON,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                          ON UPDATE CURRENT_TIMESTAMP(3),
  deletedAt DATETIME(3),
  UNIQUE KEY uq_chart(sgv_id, difficulty_name),
  INDEX idx_level(level),
  FULLTEXT KEY ft_chart_diff(difficulty_name) WITH PARSER ngram,
  FOREIGN KEY (sgv_id) REFERENCES song_game_versions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

/* ── courses ── */
CREATE TABLE courses (
  id CHAR(32) NOT NULL PRIMARY KEY,
  game_id CHAR(32) NOT NULL,
  dlc_id  CHAR(32),
  course_name VARCHAR(255) NOT NULL,
  difficulty  VARCHAR(64),
  extra JSON,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                          ON UPDATE CURRENT_TIMESTAMP(3),
  deletedAt DATETIME(3),
  UNIQUE KEY uq_course(game_id, course_name),
  INDEX idx_course_dlc(dlc_id),
  FULLTEXT KEY ft_course_name(course_name) WITH PARSER ngram,
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY (dlc_id)  REFERENCES dlcs(id) ON DELETE SET NULL
) ENGINE=InnoDB;

/* ── course_entries ── */
CREATE TABLE course_entries (
  id CHAR(32) NOT NULL PRIMARY KEY,
  course_id CHAR(32) NOT NULL,
  chart_id  CHAR(32) NOT NULL,
  position INT NOT NULL,
  extra JSON,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                          ON UPDATE CURRENT_TIMESTAMP(3),
  deletedAt DATETIME(3),
  UNIQUE KEY uq_course_chart(course_id, chart_id),
  INDEX idx_ce_chart(chart_id),
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (chart_id)  REFERENCES charts(id)  ON DELETE CASCADE
) ENGINE=InnoDB;

/* ── tags ── */
CREATE TABLE tags (
  id CHAR(32) NOT NULL PRIMARY KEY,
  name VARCHAR(64) NOT NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                          ON UPDATE CURRENT_TIMESTAMP(3),
  deletedAt DATETIME(3),
  UNIQUE KEY uq_tags_name(name),
  FULLTEXT KEY ft_tags_name(name) WITH PARSER ngram
) ENGINE=InnoDB;

/* ── song_tags ── */
CREATE TABLE song_tags (
  id CHAR(32) NOT NULL PRIMARY KEY,
  song_id CHAR(32) NOT NULL,
  tag_id CHAR(32) NOT NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                          ON UPDATE CURRENT_TIMESTAMP(3),
  deletedAt DATETIME(3),
  UNIQUE KEY uq_song_tag(song_id, tag_id),
  FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id)  REFERENCES tags(id)  ON DELETE CASCADE
) ENGINE=InnoDB;

/* ====================================================================
   OAuth 2.0 관련 테이블들
   ==================================================================== */

/* ── roles ── */
CREATE TABLE roles (
  id CHAR(32) NOT NULL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                          ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB;

/* ── permissions ── */
CREATE TABLE permissions (
  id CHAR(32) NOT NULL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                          ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB;

/* ── users (OAuth 2.0용으로 수정) ── */
CREATE TABLE users (
  id CHAR(32) NOT NULL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NULL,
  name VARCHAR(255) NULL,
  isActive BOOLEAN NOT NULL DEFAULT true,
  emailVerified BOOLEAN NOT NULL DEFAULT false,
  role_id CHAR(32) NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                          ON UPDATE CURRENT_TIMESTAMP(3),
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL
) ENGINE=InnoDB;

/* ── user_info ── */
CREATE TABLE user_info (
  id CHAR(32) NOT NULL PRIMARY KEY,
  user_id CHAR(32) NOT NULL UNIQUE,
  given_name VARCHAR(255) NULL,
  family_name VARCHAR(255) NULL,
  middle_name VARCHAR(255) NULL,
  nickname VARCHAR(255) NULL,
  picture VARCHAR(500) NULL,
  website VARCHAR(500) NULL,
  gender VARCHAR(50) NULL,
  birthdate DATETIME NULL,
  zoneinfo VARCHAR(100) NULL,
  locale VARCHAR(10) NULL,
  phone_number VARCHAR(50) NULL,
  address TEXT NULL,
  updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                          ON UPDATE CURRENT_TIMESTAMP(3),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

/* ── clients ── */
CREATE TABLE clients (
  id CHAR(32) NOT NULL PRIMARY KEY,
  owner_id CHAR(32) NULL,
  name VARCHAR(255) NOT NULL,
  client_id VARCHAR(255) NOT NULL UNIQUE,
  client_secret VARCHAR(255) NULL,
  redirect_uris TEXT NOT NULL,
  grant_types TEXT NOT NULL,
  response_types TEXT NOT NULL,
  scopes TEXT NOT NULL,
  logo_url VARCHAR(500) NULL,
  client_uri VARCHAR(500) NULL,
  policy_uri VARCHAR(500) NULL,
  tos_uri VARCHAR(500) NULL,
  jwks_uri VARCHAR(500) NULL,
  contacts TEXT NULL,
  software_id VARCHAR(255) NULL,
  software_version VARCHAR(255) NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                          ON UPDATE CURRENT_TIMESTAMP(3),
  isConfidential BOOLEAN NOT NULL DEFAULT true,
  isFirstParty BOOLEAN NOT NULL DEFAULT false,
  isActive BOOLEAN NOT NULL DEFAULT true,
  isRootClient BOOLEAN NOT NULL DEFAULT false,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

/* ── sessions ── */
CREATE TABLE sessions (
  id CHAR(32) NOT NULL PRIMARY KEY,
  user_id CHAR(32) NOT NULL,
  ip_address VARCHAR(45) NULL,
  user_agent TEXT NULL,
  expiresAt DATETIME(3) NOT NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  lastActive DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  isRevoked BOOLEAN NOT NULL DEFAULT false,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

/* ── access_tokens ── */
CREATE TABLE access_tokens (
  id CHAR(32) NOT NULL PRIMARY KEY,
  token VARCHAR(255) NOT NULL UNIQUE,
  client_id CHAR(32) NOT NULL,
  user_id CHAR(32) NULL,
  scopes TEXT NOT NULL,
  expiresAt DATETIME(3) NOT NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  isRevoked BOOLEAN NOT NULL DEFAULT false,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

/* ── refresh_tokens ── */
CREATE TABLE refresh_tokens (
  id CHAR(32) NOT NULL PRIMARY KEY,
  token VARCHAR(255) NOT NULL UNIQUE,
  client_id CHAR(32) NOT NULL,
  user_id CHAR(32) NOT NULL,
  scopes TEXT NOT NULL,
  expiresAt DATETIME(3) NOT NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  isRevoked BOOLEAN NOT NULL DEFAULT false,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

/* ── authorization_codes ── */
CREATE TABLE authorization_codes (
  id CHAR(32) NOT NULL PRIMARY KEY,
  code VARCHAR(255) NOT NULL UNIQUE,
  client_id CHAR(32) NOT NULL,
  user_id CHAR(32) NOT NULL,
  redirect_uri VARCHAR(500) NOT NULL,
  scopes TEXT NOT NULL,
  code_challenge VARCHAR(255) NULL,
  code_challenge_method VARCHAR(50) NULL,
  expiresAt DATETIME(3) NOT NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  isUsed BOOLEAN NOT NULL DEFAULT false,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

/* ====================================================================
   CMS 관련 테이블들
   ==================================================================== */

/* ── categories ── */
CREATE TABLE categories (
  id CHAR(32) NOT NULL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT NULL,
  parent_id CHAR(32) NULL,
  `order` INT NOT NULL DEFAULT 0,
  isActive BOOLEAN NOT NULL DEFAULT true,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                          ON UPDATE CURRENT_TIMESTAMP(3),
  deletedAt DATETIME(3) NULL,
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB;

/* ── posts ── */
CREATE TABLE posts (
  id CHAR(32) NOT NULL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  content LONGTEXT NOT NULL,
  excerpt TEXT NULL,
  featured_image VARCHAR(500) NULL,
  status ENUM('DRAFT', 'PUBLISHED', 'PRIVATE', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
  publishedAt DATETIME(3) NULL,
  author_id CHAR(32) NOT NULL,
  category_id CHAR(32) NULL,
  viewCount INT NOT NULL DEFAULT 0,
  isSticky BOOLEAN NOT NULL DEFAULT false,
  isCommentable BOOLEAN NOT NULL DEFAULT true,
  meta_title VARCHAR(255) NULL,
  meta_description TEXT NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                          ON UPDATE CURRENT_TIMESTAMP(3),
  deletedAt DATETIME(3) NULL,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB;

/* ── comments ── */
CREATE TABLE comments (
  id CHAR(32) NOT NULL PRIMARY KEY,
  content TEXT NOT NULL,
  post_id CHAR(32) NOT NULL,
  author_id CHAR(32) NOT NULL,
  parent_id CHAR(32) NULL,
  isApproved BOOLEAN NOT NULL DEFAULT false,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                          ON UPDATE CURRENT_TIMESTAMP(3),
  deletedAt DATETIME(3) NULL,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE SET NULL
) ENGINE=InnoDB;

/* ── cms_tags (CMS용 태그, 기존 tags와 구분) ── */
CREATE TABLE cms_tags (
  id CHAR(32) NOT NULL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                          ON UPDATE CURRENT_TIMESTAMP(3),
  deletedAt DATETIME(3) NULL
) ENGINE=InnoDB;

/* ── post_tags ── */
CREATE TABLE post_tags (
  id CHAR(32) NOT NULL PRIMARY KEY,
  post_id CHAR(32) NOT NULL,
  tag_id CHAR(32) NOT NULL,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES cms_tags(id) ON DELETE CASCADE,
  UNIQUE KEY uq_post_tag (post_id, tag_id)
) ENGINE=InnoDB;

/* ── attachments ── */
CREATE TABLE attachments (
  id CHAR(32) NOT NULL PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size INT NOT NULL,
  path VARCHAR(500) NOT NULL,
  url VARCHAR(500) NOT NULL,
  uploader_id CHAR(32) NOT NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                          ON UPDATE CURRENT_TIMESTAMP(3),
  deletedAt DATETIME(3) NULL,
  FOREIGN KEY (uploader_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

/* ── post_attachments ── */
CREATE TABLE post_attachments (
  id CHAR(32) NOT NULL PRIMARY KEY,
  post_id CHAR(32) NOT NULL,
  attachment_id CHAR(32) NOT NULL,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (attachment_id) REFERENCES attachments(id) ON DELETE CASCADE,
  UNIQUE KEY uq_post_attachment (post_id, attachment_id)
) ENGINE=InnoDB;

/* ====================================================================
   4. 기본 데이터 삽입
   ==================================================================== */

-- OAuth 2.0 기본 데이터
INSERT INTO roles (id, name, description, createdAt, updatedAt) VALUES
('admin_role_id_123456789012345678901234567890', 'admin', '관리자 역할', NOW(), NOW()),
('user_role_id_123456789012345678901234567890', 'user', '일반 사용자 역할', NOW(), NOW());

-- 기본 클라이언트 생성
INSERT INTO clients (id, name, client_id, client_secret, redirect_uris, grant_types, response_types, scopes, isConfidential, isFirstParty, isActive, isRootClient, createdAt, updatedAt) VALUES
('default_client_id_123456789012345678901234567890', 'Default Client', 'default', 'default_secret', 'http://localhost:3000/callback', 'authorization_code,refresh_token', 'code', 'read write', true, true, true, true, NOW(), NOW());

-- 기본 관리자 사용자 생성 (비밀번호: admin123)
INSERT INTO users (id, email, password, name, isActive, emailVerified, role_id, createdAt, updatedAt) VALUES
('admin_user_id_123456789012345678901234567890', 'admin@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2.', '관리자', true, true, 'admin_role_id_123456789012345678901234567890', NOW(), NOW());

-- CMS 기본 데이터
INSERT INTO categories (id, name, slug, description, `order`, isActive, createdAt, updatedAt) VALUES
('general_category_id_123456789012345678901234567890', '일반', 'general', '일반 게시물', 1, true, NOW(), NOW()),
('news_category_id_123456789012345678901234567890', '뉴스', 'news', '뉴스 및 공지사항', 2, true, NOW(), NOW()),
('guide_category_id_123456789012345678901234567890', '가이드', 'guide', '게임 가이드 및 팁', 3, true, NOW(), NOW());

-- CMS 기본 태그
INSERT INTO cms_tags (id, name, slug, description, createdAt, updatedAt) VALUES
('tag_general_id_123456789012345678901234567890', '일반', 'general', '일반 태그', NOW(), NOW()),
('tag_news_id_123456789012345678901234567890', '뉴스', 'news', '뉴스 태그', NOW(), NOW()),
('tag_guide_id_123456789012345678901234567890', '가이드', 'guide', '가이드 태그', NOW(), NOW());

-- 샘플 게시물 생성
INSERT INTO posts (id, title, slug, content, excerpt, status, author_id, category_id, isSticky, isCommentable, createdAt, updatedAt) VALUES
('sample_post_id_123456789012345678901234567890', '리듬게임 아카이브에 오신 것을 환영합니다', 'welcome-to-rhythm-game-archive', 
'<h1>리듬게임 아카이브에 오신 것을 환영합니다!</h1>
<p>이곳은 다양한 리듬게임의 곡 정보, 차트, 코스 등을 관리하는 아카이브입니다.</p>
<h2>주요 기능</h2>
<ul>
<li>곡 정보 관리</li>
<li>차트 정보 관리</li>
<li>코스 정보 관리</li>
<li>게임 및 DLC 정보 관리</li>
<li>검색 기능</li>
</ul>
<p>더 많은 기능을 확인해보세요!</p>', 
'리듬게임 아카이브에 오신 것을 환영합니다. 다양한 리듬게임 정보를 확인해보세요.', 
'PUBLISHED', 'admin_user_id_123456789012345678901234567890', 'general_category_id_123456789012345678901234567890', 
true, true, NOW(), NOW());

/* ====================================================================
   5. 마무리 & 선택적 FT 토큰 최적화
   ==================================================================== */
SET FOREIGN_KEY_CHECKS = 1;

/* 존재 시에만 최적화, 오류 무시 */
OPTIMIZE NO_WRITE_TO_BINLOG TABLE
  songs, composers, games, dlcs, courses,
  song_game_versions, charts, tags;

/* ====================================================================
   6. 사용자 및 권한 설정
   ==================================================================== */

-- rhythm 유저 생성 (비밀번호: rhythm123)
CREATE USER IF NOT EXISTS 'rhythm'@'%' IDENTIFIED BY 'rhythm123';

-- rhythm 유저에게 모든 권한 부여 (Prisma 마이그레이션을 위해 필요)
GRANT ALL PRIVILEGES ON *.* TO 'rhythm'@'%';

-- 권한 변경사항 적용
FLUSH PRIVILEGES;
