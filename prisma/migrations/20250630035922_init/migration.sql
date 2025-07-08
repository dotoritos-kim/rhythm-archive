-- CreateTable
CREATE TABLE `roles` (
    `id` CHAR(32) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `roles_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permissions` (
    `id` CHAR(32) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `permissions_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` CHAR(32) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NULL,
    `name` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `emailVerified` BOOLEAN NOT NULL DEFAULT false,
    `role_id` CHAR(32) NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_info` (
    `id` CHAR(32) NOT NULL,
    `user_id` CHAR(32) NOT NULL,
    `given_name` VARCHAR(255) NULL,
    `family_name` VARCHAR(255) NULL,
    `middle_name` VARCHAR(255) NULL,
    `nickname` VARCHAR(255) NULL,
    `picture` VARCHAR(500) NULL,
    `website` VARCHAR(500) NULL,
    `gender` VARCHAR(50) NULL,
    `birthdate` DATETIME(3) NULL,
    `zoneinfo` VARCHAR(100) NULL,
    `locale` VARCHAR(10) NULL,
    `phone_number` VARCHAR(50) NULL,
    `address` TEXT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_info_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `clients` (
    `id` CHAR(32) NOT NULL,
    `owner_id` CHAR(32) NULL,
    `name` VARCHAR(255) NOT NULL,
    `client_id` VARCHAR(255) NOT NULL,
    `client_secret` VARCHAR(255) NULL,
    `redirect_uris` TEXT NOT NULL,
    `grant_types` TEXT NOT NULL,
    `response_types` TEXT NOT NULL,
    `scopes` TEXT NOT NULL,
    `logo_url` VARCHAR(500) NULL,
    `client_uri` VARCHAR(500) NULL,
    `policy_uri` VARCHAR(500) NULL,
    `tos_uri` VARCHAR(500) NULL,
    `jwks_uri` VARCHAR(500) NULL,
    `contacts` TEXT NULL,
    `software_id` VARCHAR(255) NULL,
    `software_version` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `isConfidential` BOOLEAN NOT NULL DEFAULT true,
    `isFirstParty` BOOLEAN NOT NULL DEFAULT false,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `isRootClient` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `clients_client_id_key`(`client_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sessions` (
    `id` CHAR(32) NOT NULL,
    `user_id` CHAR(32) NOT NULL,
    `ip_address` VARCHAR(45) NULL,
    `user_agent` TEXT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lastActive` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `isRevoked` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `access_tokens` (
    `id` CHAR(32) NOT NULL,
    `token` VARCHAR(255) NOT NULL,
    `client_id` CHAR(32) NOT NULL,
    `user_id` CHAR(32) NULL,
    `scopes` TEXT NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `isRevoked` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `access_tokens_token_key`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `refresh_tokens` (
    `id` CHAR(32) NOT NULL,
    `token` VARCHAR(255) NOT NULL,
    `client_id` CHAR(32) NOT NULL,
    `user_id` CHAR(32) NOT NULL,
    `scopes` TEXT NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `isRevoked` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `refresh_tokens_token_key`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `authorization_codes` (
    `id` CHAR(32) NOT NULL,
    `code` VARCHAR(255) NOT NULL,
    `client_id` CHAR(32) NOT NULL,
    `user_id` CHAR(32) NOT NULL,
    `redirect_uri` VARCHAR(500) NOT NULL,
    `scopes` TEXT NOT NULL,
    `code_challenge` VARCHAR(255) NULL,
    `code_challenge_method` VARCHAR(50) NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `isUsed` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `authorization_codes_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categories` (
    `id` CHAR(32) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `parent_id` CHAR(32) NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `categories_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `posts` (
    `id` CHAR(32) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `content` LONGTEXT NOT NULL,
    `excerpt` TEXT NULL,
    `featured_image` VARCHAR(500) NULL,
    `status` ENUM('DRAFT', 'PUBLISHED', 'PRIVATE', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `publishedAt` DATETIME(3) NULL,
    `author_id` CHAR(32) NOT NULL,
    `category_id` CHAR(32) NULL,
    `viewCount` INTEGER NOT NULL DEFAULT 0,
    `isSticky` BOOLEAN NOT NULL DEFAULT false,
    `isCommentable` BOOLEAN NOT NULL DEFAULT true,
    `meta_title` VARCHAR(255) NULL,
    `meta_description` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `posts_slug_key`(`slug`),
    FULLTEXT INDEX `ft_posts`(`title`, `content`, `excerpt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comments` (
    `id` CHAR(32) NOT NULL,
    `content` TEXT NOT NULL,
    `post_id` CHAR(32) NOT NULL,
    `author_id` CHAR(32) NOT NULL,
    `parent_id` CHAR(32) NULL,
    `isApproved` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cms_tags` (
    `id` CHAR(32) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `cms_tags_name_key`(`name`),
    UNIQUE INDEX `cms_tags_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `post_tags` (
    `id` CHAR(32) NOT NULL,
    `post_id` CHAR(32) NOT NULL,
    `tag_id` CHAR(32) NOT NULL,

    UNIQUE INDEX `uq_post_tag`(`post_id`, `tag_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `attachments` (
    `id` CHAR(32) NOT NULL,
    `filename` VARCHAR(255) NOT NULL,
    `original_name` VARCHAR(255) NOT NULL,
    `mime_type` VARCHAR(100) NOT NULL,
    `size` INTEGER NOT NULL,
    `path` VARCHAR(500) NOT NULL,
    `url` VARCHAR(500) NOT NULL,
    `uploader_id` CHAR(32) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `post_attachments` (
    `id` CHAR(32) NOT NULL,
    `post_id` CHAR(32) NOT NULL,
    `attachment_id` CHAR(32) NOT NULL,

    UNIQUE INDEX `uq_post_attachment`(`post_id`, `attachment_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `songs` (
    `id` CHAR(32) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `original_title` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `uq_songs_title`(`title`),
    FULLTEXT INDEX `ft_songs_title`(`title`, `original_title`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `song_infos` (
    `id` CHAR(32) NOT NULL,
    `song_id` CHAR(32) NOT NULL,
    `bpm` DECIMAL(6, 2) NULL,
    `beat` VARCHAR(32) NULL,
    `length_sec` INTEGER NULL,
    `extra` LONGTEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `song_infos_song_id_key`(`song_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `composers` (
    `id` CHAR(32) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `company_name` VARCHAR(255) NULL,
    `extra` LONGTEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `uq_composer_name_company`(`name`, `company_name`),
    FULLTEXT INDEX `ft_composers`(`name`, `company_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `song_composers` (
    `id` CHAR(32) NOT NULL,
    `song_id` CHAR(32) NOT NULL,
    `composer_id` CHAR(32) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `idx_song_composers_composer`(`composer_id`),
    UNIQUE INDEX `uq_song_composer`(`song_id`, `composer_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `games` (
    `id` CHAR(32) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `release_date` DATE NULL,
    `publisher` VARCHAR(255) NULL,
    `extra` LONGTEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `games_name_key`(`name`),
    FULLTEXT INDEX `ft_games_name`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dlcs` (
    `id` CHAR(32) NOT NULL,
    `game_id` CHAR(32) NOT NULL,
    `dlc_name` VARCHAR(255) NOT NULL,
    `release_date` DATE NULL,
    `extra` LONGTEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `uq_dlcs_game_name`(`game_id`, `dlc_name`),
    FULLTEXT INDEX `ft_dlcs_name`(`dlc_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `song_game_versions` (
    `id` CHAR(32) NOT NULL,
    `song_id` CHAR(32) NOT NULL,
    `game_id` CHAR(32) NOT NULL,
    `dlc_id` CHAR(32) NULL,
    `in_game_title` VARCHAR(255) NULL,
    `bpm_override` DECIMAL(6, 2) NULL,
    `length_sec` INTEGER NULL,
    `arrangement` VARCHAR(128) NULL,
    `first_version` VARCHAR(255) NULL,
    `first_date` DATE NULL,
    `extra` LONGTEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `idx_sgv_game`(`game_id`),
    INDEX `idx_sgv_dlc`(`dlc_id`),
    UNIQUE INDEX `uq_sgv_unique`(`song_id`, `game_id`, `dlc_id`, `in_game_title`),
    FULLTEXT INDEX `ft_sgv`(`in_game_title`, `arrangement`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `charts` (
    `id` CHAR(32) NOT NULL,
    `sgv_id` CHAR(32) NOT NULL,
    `difficulty_name` VARCHAR(64) NOT NULL,
    `level` DECIMAL(4, 2) NOT NULL,
    `note_count` INTEGER NULL,
    `chart_type` VARCHAR(64) NULL,
    `extra` LONGTEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `idx_charts_level`(`level`),
    UNIQUE INDEX `uq_charts_sgv_diff`(`sgv_id`, `difficulty_name`),
    FULLTEXT INDEX `ft_chart_diff`(`difficulty_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `courses` (
    `id` CHAR(32) NOT NULL,
    `game_id` CHAR(32) NOT NULL,
    `dlc_id` CHAR(32) NULL,
    `course_name` VARCHAR(255) NOT NULL,
    `difficulty` VARCHAR(64) NULL,
    `extra` LONGTEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `idx_courses_dlc`(`dlc_id`),
    UNIQUE INDEX `uq_courses_game_name`(`game_id`, `course_name`),
    FULLTEXT INDEX `ft_course_name`(`course_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `course_entries` (
    `id` CHAR(32) NOT NULL,
    `course_id` CHAR(32) NOT NULL,
    `chart_id` CHAR(32) NOT NULL,
    `position` INTEGER NOT NULL,
    `extra` LONGTEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `idx_course_entries_chart`(`chart_id`),
    UNIQUE INDEX `uq_course_chart`(`course_id`, `chart_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `song_tags` (
    `id` CHAR(32) NOT NULL,
    `song_id` CHAR(32) NOT NULL,
    `tag_id` CHAR(32) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `uq_song_tag`(`song_id`, `tag_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `song_tag_items` (
    `id` CHAR(32) NOT NULL,
    `name` VARCHAR(64) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `song_tag_items_name_key`(`name`),
    FULLTEXT INDEX `ft_song_tags_name`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `favorite_lists` (
    `id` CHAR(32) NOT NULL,
    `user_id` CHAR(32) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `isPublic` BOOLEAN NOT NULL DEFAULT false,
    `isDefault` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `favorite_items` (
    `id` CHAR(32) NOT NULL,
    `favorite_list_id` CHAR(32) NOT NULL,
    `item_type` VARCHAR(50) NOT NULL,
    `item_id` CHAR(32) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `metadata` TEXT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `favorite_items_favorite_list_id_item_type_item_id_key`(`favorite_list_id`, `item_type`, `item_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `favorite_tags` (
    `id` CHAR(32) NOT NULL,
    `favorite_list_id` CHAR(32) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `color` VARCHAR(7) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `favorite_tags_favorite_list_id_name_key`(`favorite_list_id`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `favorite_item_tags` (
    `id` CHAR(32) NOT NULL,
    `favorite_item_id` CHAR(32) NOT NULL,
    `favorite_tag_id` CHAR(32) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `favorite_item_tags_favorite_item_id_favorite_tag_id_key`(`favorite_item_id`, `favorite_tag_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_info` ADD CONSTRAINT `user_info_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `clients` ADD CONSTRAINT `clients_owner_id_fkey` FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `access_tokens` ADD CONSTRAINT `access_tokens_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `access_tokens` ADD CONSTRAINT `access_tokens_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `refresh_tokens` ADD CONSTRAINT `refresh_tokens_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `refresh_tokens` ADD CONSTRAINT `refresh_tokens_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `authorization_codes` ADD CONSTRAINT `authorization_codes_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `authorization_codes` ADD CONSTRAINT `authorization_codes_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `categories` ADD CONSTRAINT `categories_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `posts` ADD CONSTRAINT `posts_author_id_fkey` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `posts` ADD CONSTRAINT `posts_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comments` ADD CONSTRAINT `comments_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comments` ADD CONSTRAINT `comments_author_id_fkey` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comments` ADD CONSTRAINT `comments_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `comments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `post_tags` ADD CONSTRAINT `post_tags_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `post_tags` ADD CONSTRAINT `post_tags_tag_id_fkey` FOREIGN KEY (`tag_id`) REFERENCES `cms_tags`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attachments` ADD CONSTRAINT `attachments_uploader_id_fkey` FOREIGN KEY (`uploader_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `post_attachments` ADD CONSTRAINT `post_attachments_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `post_attachments` ADD CONSTRAINT `post_attachments_attachment_id_fkey` FOREIGN KEY (`attachment_id`) REFERENCES `attachments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `song_infos` ADD CONSTRAINT `song_infos_song_id_fkey` FOREIGN KEY (`song_id`) REFERENCES `songs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `song_composers` ADD CONSTRAINT `song_composers_composer_id_fkey` FOREIGN KEY (`composer_id`) REFERENCES `composers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `song_composers` ADD CONSTRAINT `song_composers_song_id_fkey` FOREIGN KEY (`song_id`) REFERENCES `songs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dlcs` ADD CONSTRAINT `dlcs_game_id_fkey` FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `song_game_versions` ADD CONSTRAINT `song_game_versions_dlc_id_fkey` FOREIGN KEY (`dlc_id`) REFERENCES `dlcs`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `song_game_versions` ADD CONSTRAINT `song_game_versions_game_id_fkey` FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `song_game_versions` ADD CONSTRAINT `song_game_versions_song_id_fkey` FOREIGN KEY (`song_id`) REFERENCES `songs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `charts` ADD CONSTRAINT `charts_sgv_id_fkey` FOREIGN KEY (`sgv_id`) REFERENCES `song_game_versions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `courses` ADD CONSTRAINT `courses_dlc_id_fkey` FOREIGN KEY (`dlc_id`) REFERENCES `dlcs`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `courses` ADD CONSTRAINT `courses_game_id_fkey` FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course_entries` ADD CONSTRAINT `course_entries_chart_id_fkey` FOREIGN KEY (`chart_id`) REFERENCES `charts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course_entries` ADD CONSTRAINT `course_entries_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `song_tags` ADD CONSTRAINT `song_tags_song_id_fkey` FOREIGN KEY (`song_id`) REFERENCES `songs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `song_tags` ADD CONSTRAINT `song_tags_tag_id_fkey` FOREIGN KEY (`tag_id`) REFERENCES `song_tag_items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `favorite_lists` ADD CONSTRAINT `favorite_lists_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `favorite_items` ADD CONSTRAINT `favorite_items_favorite_list_id_fkey` FOREIGN KEY (`favorite_list_id`) REFERENCES `favorite_lists`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `favorite_tags` ADD CONSTRAINT `favorite_tags_favorite_list_id_fkey` FOREIGN KEY (`favorite_list_id`) REFERENCES `favorite_lists`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `favorite_item_tags` ADD CONSTRAINT `favorite_item_tags_favorite_item_id_fkey` FOREIGN KEY (`favorite_item_id`) REFERENCES `favorite_items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `favorite_item_tags` ADD CONSTRAINT `favorite_item_tags_favorite_tag_id_fkey` FOREIGN KEY (`favorite_tag_id`) REFERENCES `favorite_tags`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
