-- OAuth 2.0 및 CMS 테이블 생성 스크립트

-- 기존 users 테이블 수정
ALTER TABLE users 
ADD COLUMN password VARCHAR(255) NULL,
ADD COLUMN isActive BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN emailVerified BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN role_id CHAR(32) NULL,
MODIFY COLUMN id CHAR(32) NOT NULL,
MODIFY COLUMN email VARCHAR(255) NOT NULL,
MODIFY COLUMN name VARCHAR(255) NULL;

-- roles 테이블 생성
CREATE TABLE roles (
  id CHAR(32) NOT NULL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL
);

-- permissions 테이블 생성
CREATE TABLE permissions (
  id CHAR(32) NOT NULL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL
);

-- user_info 테이블 생성
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
  updatedAt DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- clients 테이블 생성
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
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL,
  isConfidential BOOLEAN NOT NULL DEFAULT true,
  isFirstParty BOOLEAN NOT NULL DEFAULT false,
  isActive BOOLEAN NOT NULL DEFAULT true,
  isRootClient BOOLEAN NOT NULL DEFAULT false,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
);

-- sessions 테이블 생성
CREATE TABLE sessions (
  id CHAR(32) NOT NULL PRIMARY KEY,
  user_id CHAR(32) NOT NULL,
  ip_address VARCHAR(45) NULL,
  user_agent TEXT NULL,
  expiresAt DATETIME NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  lastActive DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  isRevoked BOOLEAN NOT NULL DEFAULT false,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- access_tokens 테이블 생성
CREATE TABLE access_tokens (
  id CHAR(32) NOT NULL PRIMARY KEY,
  token VARCHAR(255) NOT NULL UNIQUE,
  client_id CHAR(32) NOT NULL,
  user_id CHAR(32) NULL,
  scopes TEXT NOT NULL,
  expiresAt DATETIME NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  isRevoked BOOLEAN NOT NULL DEFAULT false,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- refresh_tokens 테이블 생성
CREATE TABLE refresh_tokens (
  id CHAR(32) NOT NULL PRIMARY KEY,
  token VARCHAR(255) NOT NULL UNIQUE,
  client_id CHAR(32) NOT NULL,
  user_id CHAR(32) NOT NULL,
  scopes TEXT NOT NULL,
  expiresAt DATETIME NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  isRevoked BOOLEAN NOT NULL DEFAULT false,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- authorization_codes 테이블 생성
CREATE TABLE authorization_codes (
  id CHAR(32) NOT NULL PRIMARY KEY,
  code VARCHAR(255) NOT NULL UNIQUE,
  client_id CHAR(32) NOT NULL,
  user_id CHAR(32) NOT NULL,
  redirect_uri VARCHAR(500) NOT NULL,
  scopes TEXT NOT NULL,
  code_challenge VARCHAR(255) NULL,
  code_challenge_method VARCHAR(50) NULL,
  expiresAt DATETIME NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  isUsed BOOLEAN NOT NULL DEFAULT false,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- users 테이블에 role_id 외래키 추가
ALTER TABLE users 
ADD FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL;

-- CMS 관련 테이블들

-- categories 테이블 생성
CREATE TABLE categories (
  id CHAR(32) NOT NULL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT NULL,
  parent_id CHAR(32) NULL,
  `order` INT NOT NULL DEFAULT 0,
  isActive BOOLEAN NOT NULL DEFAULT true,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL,
  deletedAt DATETIME NULL,
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- posts 테이블 생성
CREATE TABLE posts (
  id CHAR(32) NOT NULL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  content LONGTEXT NOT NULL,
  excerpt TEXT NULL,
  featured_image VARCHAR(500) NULL,
  status ENUM('DRAFT', 'PUBLISHED', 'PRIVATE', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
  publishedAt DATETIME NULL,
  author_id CHAR(32) NOT NULL,
  category_id CHAR(32) NULL,
  viewCount INT NOT NULL DEFAULT 0,
  isSticky BOOLEAN NOT NULL DEFAULT false,
  isCommentable BOOLEAN NOT NULL DEFAULT true,
  meta_title VARCHAR(255) NULL,
  meta_description TEXT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL,
  deletedAt DATETIME NULL,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- comments 테이블 생성
CREATE TABLE comments (
  id CHAR(32) NOT NULL PRIMARY KEY,
  content TEXT NOT NULL,
  post_id CHAR(32) NOT NULL,
  author_id CHAR(32) NOT NULL,
  parent_id CHAR(32) NULL,
  isApproved BOOLEAN NOT NULL DEFAULT false,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL,
  deletedAt DATETIME NULL,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE SET NULL
);

-- tags 테이블 생성 (CMS용)
CREATE TABLE tags (
  id CHAR(32) NOT NULL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL,
  deletedAt DATETIME NULL
);

-- post_tags 테이블 생성
CREATE TABLE post_tags (
  id CHAR(32) NOT NULL PRIMARY KEY,
  post_id CHAR(32) NOT NULL,
  tag_id CHAR(32) NOT NULL,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
  UNIQUE KEY uq_post_tag (post_id, tag_id)
);

-- attachments 테이블 생성
CREATE TABLE attachments (
  id CHAR(32) NOT NULL PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size INT NOT NULL,
  path VARCHAR(500) NOT NULL,
  url VARCHAR(500) NOT NULL,
  uploader_id CHAR(32) NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL,
  deletedAt DATETIME NULL,
  FOREIGN KEY (uploader_id) REFERENCES users(id) ON DELETE CASCADE
);

-- post_attachments 테이블 생성
CREATE TABLE post_attachments (
  id CHAR(32) NOT NULL PRIMARY KEY,
  post_id CHAR(32) NOT NULL,
  attachment_id CHAR(32) NOT NULL,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (attachment_id) REFERENCES attachments(id) ON DELETE CASCADE,
  UNIQUE KEY uq_post_attachment (post_id, attachment_id)
);

-- 기존 song_tag_items 테이블 생성 (기존 tags 테이블과 구분)
CREATE TABLE song_tag_items (
  id CHAR(32) NOT NULL PRIMARY KEY,
  name VARCHAR(64) NOT NULL UNIQUE,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL,
  deletedAt DATETIME NULL
);

-- song_tags 테이블의 tag_id를 song_tag_items로 변경
ALTER TABLE song_tags 
DROP FOREIGN KEY song_tags_ibfk_2;

ALTER TABLE song_tags 
ADD CONSTRAINT song_tags_ibfk_2 
FOREIGN KEY (tag_id) REFERENCES song_tag_items(id) ON DELETE CASCADE;

-- 기본 역할 생성
INSERT INTO roles (id, name, description, createdAt, updatedAt) VALUES
('admin_role_id_123456789012345678901234567890', 'admin', '관리자 역할', NOW(), NOW()),
('user_role_id_123456789012345678901234567890', 'user', '일반 사용자 역할', NOW(), NOW());

-- 기본 클라이언트 생성
INSERT INTO clients (id, name, client_id, client_secret, redirect_uris, grant_types, response_types, scopes, isConfidential, isFirstParty, isActive, isRootClient, createdAt, updatedAt) VALUES
('default_client_id_123456789012345678901234567890', 'Default Client', 'default', 'default_secret', 'http://localhost:3000/callback', 'authorization_code,refresh_token', 'code', 'read write', true, true, true, true, NOW(), NOW());

-- 풀텍스트 인덱스 추가
ALTER TABLE posts ADD FULLTEXT INDEX ft_posts (title, content, excerpt);
ALTER TABLE song_tag_items ADD FULLTEXT INDEX ft_song_tags_name (name); 