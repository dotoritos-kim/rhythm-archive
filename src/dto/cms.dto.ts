import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsEnum,
  IsNumber,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum PostStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  PRIVATE = 'PRIVATE',
  ARCHIVED = 'ARCHIVED',
}

export class CreateCategoryDto {
  @ApiProperty({
    description: '카테고리 이름',
    example: '공지사항',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: '카테고리 슬러그',
    example: 'notice',
  })
  @IsString()
  slug: string;

  @ApiProperty({
    description: '카테고리 설명',
    example: '중요한 공지사항을 확인하세요',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: '상위 카테고리 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsString()
  @IsOptional()
  parentId?: string;

  @ApiProperty({
    description: '정렬 순서',
    example: 1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  order?: number;

  @ApiProperty({
    description: '활성화 상태',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateCategoryDto {
  @ApiProperty({
    description: '카테고리 이름',
    example: '공지사항',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: '카테고리 슬러그',
    example: 'notice',
    required: false,
  })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({
    description: '카테고리 설명',
    example: '중요한 공지사항을 확인하세요',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: '상위 카테고리 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsString()
  @IsOptional()
  parentId?: string;

  @ApiProperty({
    description: '정렬 순서',
    example: 1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  order?: number;

  @ApiProperty({
    description: '활성화 상태',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class CategoryDto {
  @ApiProperty({
    description: '카테고리 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: '카테고리 이름',
    example: '공지사항',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: '카테고리 슬러그',
    example: 'notice',
  })
  @IsString()
  slug: string;

  @ApiProperty({
    description: '카테고리 설명',
    example: '중요한 공지사항을 확인하세요',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: '상위 카테고리 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsString()
  @IsOptional()
  parentId?: string;

  @ApiProperty({
    description: '정렬 순서',
    example: 1,
  })
  @IsNumber()
  order: number;

  @ApiProperty({
    description: '활성화 상태',
    example: true,
  })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({
    description: '생성일',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsDateString()
  createdAt: string;

  @ApiProperty({
    description: '수정일',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsDateString()
  updatedAt: string;
}

export class CreatePostDto {
  @ApiProperty({
    description: '게시글 제목',
    example: '리듬게임 업데이트 안내',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: '게시글 슬러그',
    example: 'rhythm-game-update-notice',
  })
  @IsString()
  slug: string;

  @ApiProperty({
    description: '게시글 내용',
    example: '새로운 곡들이 추가되었습니다...',
  })
  @IsString()
  content: string;

  @ApiProperty({
    description: '게시글 요약',
    example: '새로운 곡들이 추가되었습니다',
    required: false,
  })
  @IsString()
  @IsOptional()
  excerpt?: string;

  @ApiProperty({
    description: '대표 이미지 URL',
    example: 'https://example.com/image.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  featuredImage?: string;

  @ApiProperty({
    description: '게시글 상태',
    enum: PostStatus,
    example: PostStatus.PUBLISHED,
    required: false,
  })
  @IsEnum(PostStatus)
  @IsOptional()
  status?: PostStatus;

  @ApiProperty({
    description: '카테고리 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiProperty({
    description: '태그 ID 목록',
    example: ['tag1', 'tag2'],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tagIds?: string[];

  @ApiProperty({
    description: '상단 고정 여부',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isSticky?: boolean;

  @ApiProperty({
    description: '댓글 허용 여부',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isCommentable?: boolean;

  @ApiProperty({
    description: '메타 제목',
    example: 'SEO 제목',
    required: false,
  })
  @IsString()
  @IsOptional()
  metaTitle?: string;

  @ApiProperty({
    description: '메타 설명',
    example: 'SEO 설명',
    required: false,
  })
  @IsString()
  @IsOptional()
  metaDescription?: string;
}

export class UpdatePostDto {
  @ApiProperty({
    description: '게시글 제목',
    example: '리듬게임 업데이트 안내',
    required: false,
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: '게시글 슬러그',
    example: 'rhythm-game-update-notice',
    required: false,
  })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({
    description: '게시글 내용',
    example: '새로운 곡들이 추가되었습니다...',
    required: false,
  })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({
    description: '게시글 요약',
    example: '새로운 곡들이 추가되었습니다',
    required: false,
  })
  @IsString()
  @IsOptional()
  excerpt?: string;

  @ApiProperty({
    description: '대표 이미지 URL',
    example: 'https://example.com/image.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  featuredImage?: string;

  @ApiProperty({
    description: '게시글 상태',
    enum: PostStatus,
    example: PostStatus.PUBLISHED,
    required: false,
  })
  @IsEnum(PostStatus)
  @IsOptional()
  status?: PostStatus;

  @ApiProperty({
    description: '발행일',
    example: '2024-01-01T00:00:00.000Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  publishedAt?: string;

  @ApiProperty({
    description: '카테고리 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiProperty({
    description: '태그 ID 목록',
    example: ['tag1', 'tag2'],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tagIds?: string[];

  @ApiProperty({
    description: '상단 고정 여부',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isSticky?: boolean;

  @ApiProperty({
    description: '댓글 허용 여부',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isCommentable?: boolean;

  @ApiProperty({
    description: '메타 제목',
    example: 'SEO 제목',
    required: false,
  })
  @IsString()
  @IsOptional()
  metaTitle?: string;

  @ApiProperty({
    description: '메타 설명',
    example: 'SEO 설명',
    required: false,
  })
  @IsString()
  @IsOptional()
  metaDescription?: string;
}

export class PostDto {
  @ApiProperty({
    description: '게시글 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: '게시글 제목',
    example: '리듬게임 업데이트 안내',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: '게시글 슬러그',
    example: 'rhythm-game-update-notice',
  })
  @IsString()
  slug: string;

  @ApiProperty({
    description: '게시글 내용',
    example: '새로운 곡들이 추가되었습니다...',
  })
  @IsString()
  content: string;

  @ApiProperty({
    description: '게시글 요약',
    example: '새로운 곡들이 추가되었습니다',
    required: false,
  })
  @IsString()
  @IsOptional()
  excerpt?: string;

  @ApiProperty({
    description: '대표 이미지 URL',
    example: 'https://example.com/image.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  featuredImage?: string;

  @ApiProperty({
    description: '게시글 상태',
    enum: PostStatus,
    example: PostStatus.PUBLISHED,
  })
  @IsEnum(PostStatus)
  status: PostStatus;

  @ApiProperty({
    description: '발행일',
    example: '2024-01-01T00:00:00.000Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  publishedAt?: string;

  @ApiProperty({
    description: '작성자 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  authorId: string;

  @ApiProperty({
    description: '카테고리 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiProperty({
    description: '조회수',
    example: 100,
  })
  @IsNumber()
  viewCount: number;

  @ApiProperty({
    description: '상단 고정 여부',
    example: false,
  })
  @IsBoolean()
  isSticky: boolean;

  @ApiProperty({
    description: '댓글 허용 여부',
    example: true,
  })
  @IsBoolean()
  isCommentable: boolean;

  @ApiProperty({
    description: '메타 제목',
    example: 'SEO 제목',
    required: false,
  })
  @IsString()
  @IsOptional()
  metaTitle?: string;

  @ApiProperty({
    description: '메타 설명',
    example: 'SEO 설명',
    required: false,
  })
  @IsString()
  @IsOptional()
  metaDescription?: string;

  @ApiProperty({
    description: '생성일',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsDateString()
  createdAt: string;

  @ApiProperty({
    description: '수정일',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsDateString()
  updatedAt: string;
}

export class CreateCommentDto {
  @ApiProperty({
    description: '댓글 내용',
    example: '좋은 정보 감사합니다!',
  })
  @IsString()
  content: string;

  @ApiProperty({
    description: '게시글 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  postId: string;

  @ApiProperty({
    description: '상위 댓글 ID (대댓글인 경우)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsString()
  @IsOptional()
  parentId?: string;
}

export class UpdateCommentDto {
  @ApiProperty({
    description: '댓글 내용',
    example: '좋은 정보 감사합니다!',
  })
  @IsString()
  content: string;
}

export class CommentDto {
  @ApiProperty({
    description: '댓글 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: '댓글 내용',
    example: '좋은 정보 감사합니다!',
  })
  @IsString()
  content: string;

  @ApiProperty({
    description: '게시글 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  postId: string;

  @ApiProperty({
    description: '작성자 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  authorId: string;

  @ApiProperty({
    description: '상위 댓글 ID (대댓글인 경우)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsString()
  @IsOptional()
  parentId?: string;

  @ApiProperty({
    description: '승인 상태',
    example: true,
  })
  @IsBoolean()
  isApproved: boolean;

  @ApiProperty({
    description: '생성일',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsDateString()
  createdAt: string;

  @ApiProperty({
    description: '수정일',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsDateString()
  updatedAt: string;
}

export class CreateCmsTagDto {
  @ApiProperty({
    description: '태그 이름',
    example: '리듬게임',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: '태그 슬러그',
    example: 'rhythm-game',
  })
  @IsString()
  slug: string;

  @ApiProperty({
    description: '태그 설명',
    example: '리듬게임 관련 태그',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateCmsTagDto {
  @ApiProperty({
    description: '태그 이름',
    example: '리듬게임',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: '태그 슬러그',
    example: 'rhythm-game',
    required: false,
  })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({
    description: '태그 설명',
    example: '리듬게임 관련 태그',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}

export class TagDto {
  @ApiProperty({
    description: '태그 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: '태그 이름',
    example: '리듬게임',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: '태그 슬러그',
    example: 'rhythm-game',
  })
  @IsString()
  slug: string;

  @ApiProperty({
    description: '태그 설명',
    example: '리듬게임 관련 태그',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: '생성일',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsDateString()
  createdAt: string;

  @ApiProperty({
    description: '수정일',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsDateString()
  updatedAt: string;
}

export class AttachmentDto {
  @ApiProperty({
    description: '첨부파일 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: '파일명',
    example: 'document.pdf',
  })
  @IsString()
  filename: string;

  @ApiProperty({
    description: '원본 파일명',
    example: 'my-document.pdf',
  })
  @IsString()
  originalName: string;

  @ApiProperty({
    description: 'MIME 타입',
    example: 'application/pdf',
  })
  @IsString()
  mimeType: string;

  @ApiProperty({
    description: '파일 크기 (bytes)',
    example: 1024000,
  })
  @IsNumber()
  size: number;

  @ApiProperty({
    description: '파일 경로',
    example: '/uploads/documents/document.pdf',
  })
  @IsString()
  path: string;

  @ApiProperty({
    description: '파일 URL',
    example: 'https://example.com/uploads/documents/document.pdf',
  })
  @IsString()
  url: string;

  @ApiProperty({
    description: '업로더 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  uploaderId: string;

  @ApiProperty({
    description: '생성일',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsDateString()
  createdAt: string;

  @ApiProperty({
    description: '수정일',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsDateString()
  updatedAt: string;
}
