import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreatePostDto,
  UpdatePostDto,
  PostDto,
  PostStatus,
} from '../dto/cms.dto';
import { v4 as uuidv4 } from 'uuid';

interface PostQuery {
  title?: string;
  status?: PostStatus;
  categoryId?: string;
  authorId?: string;
  isSticky?: string;
}

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PostQuery): Promise<PostDto[]> {
    const { title, status, categoryId, authorId, isSticky } = query;

    const where: Record<string, unknown> = {};

    if (title) {
      where.title = {
        contains: title,
        mode: 'insensitive',
      };
    }

    if (status) {
      where.status = status;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (authorId) {
      where.authorId = authorId;
    }

    if (isSticky !== undefined) {
      where.isSticky = isSticky === 'true';
    }

    const posts = await this.prisma.post.findMany({
      where,
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
        author: true,
        attachments: {
          include: {
            attachment: true,
          },
        },
      },
      orderBy: [
        { isSticky: 'desc' },
        { publishedAt: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return posts.map((post) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt || undefined,
      featuredImage: post.featuredImage || undefined,
      status: post.status as PostStatus,
      publishedAt: post.publishedAt?.toISOString() || undefined,
      authorId: post.authorId,
      categoryId: post.categoryId || undefined,
      viewCount: post.viewCount,
      isSticky: post.isSticky,
      isCommentable: post.isCommentable,
      metaTitle: post.metaTitle || undefined,
      metaDescription: post.metaDescription || undefined,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    }));
  }

  async findOne(id: string): Promise<PostDto> {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
        author: true,
        comments: true,
        attachments: {
          include: {
            attachment: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt || undefined,
      featuredImage: post.featuredImage || undefined,
      status: post.status as PostStatus,
      publishedAt: post.publishedAt?.toISOString() || undefined,
      authorId: post.authorId,
      categoryId: post.categoryId || undefined,
      viewCount: post.viewCount,
      isSticky: post.isSticky,
      isCommentable: post.isCommentable,
      metaTitle: post.metaTitle || undefined,
      metaDescription: post.metaDescription || undefined,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    };
  }

  async create(dto: CreatePostDto, authorId: string): Promise<PostDto> {
    // 슬러그 중복 확인
    const existingPost = await this.prisma.post.findUnique({
      where: { slug: dto.slug },
    });

    if (existingPost) {
      throw new BadRequestException('이미 존재하는 슬러그입니다.');
    }

    // 카테고리 존재 확인
    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
      });

      if (!category) {
        throw new BadRequestException('카테고리를 찾을 수 없습니다.');
      }
    }

    // 기본값 설정
    const data = {
      id: uuidv4().replace(/-/g, ''),
      title: dto.title,
      slug: dto.slug,
      content: dto.content,
      excerpt: dto.excerpt || null,
      featuredImage: dto.featuredImage || null,
      status: dto.status || PostStatus.DRAFT,
      publishedAt: dto.status === PostStatus.PUBLISHED ? new Date() : null,
      authorId,
      categoryId: dto.categoryId || null,
      viewCount: 0,
      isSticky: dto.isSticky || false,
      isCommentable: dto.isCommentable !== undefined ? dto.isCommentable : true,
      metaTitle: dto.metaTitle || null,
      metaDescription: dto.metaDescription || null,
    };

    const post = await this.prisma.post.create({
      data,
    });

    // 태그 연결
    if (dto.tagIds && dto.tagIds.length > 0) {
      const tagConnections = dto.tagIds.map((tagId) => ({
        id: uuidv4().replace(/-/g, ''),
        postId: post.id,
        tagId,
      }));

      await this.prisma.postTag.createMany({
        data: tagConnections,
      });
    }

    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt || undefined,
      featuredImage: post.featuredImage || undefined,
      status: post.status as PostStatus,
      publishedAt: post.publishedAt?.toISOString() || undefined,
      authorId: post.authorId,
      categoryId: post.categoryId || undefined,
      viewCount: post.viewCount,
      isSticky: post.isSticky,
      isCommentable: post.isCommentable,
      metaTitle: post.metaTitle || undefined,
      metaDescription: post.metaDescription || undefined,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    };
  }

  async update(id: string, dto: UpdatePostDto): Promise<PostDto> {
    // 게시글 존재 확인
    const existingPost = await this.prisma.post.findUnique({
      where: { id },
    });

    if (!existingPost) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    // 슬러그 중복 확인 (자신 제외)
    if (dto.slug) {
      const duplicateSlug = await this.prisma.post.findFirst({
        where: {
          slug: dto.slug,
          id: { not: id },
        },
      });

      if (duplicateSlug) {
        throw new BadRequestException('이미 존재하는 슬러그입니다.');
      }
    }

    // 카테고리 존재 확인
    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
      });

      if (!category) {
        throw new BadRequestException('카테고리를 찾을 수 없습니다.');
      }
    }

    // 발행 상태 변경 시 publishedAt 업데이트
    const updateData: Record<string, unknown> = { ...dto };
    if (
      dto.status === PostStatus.PUBLISHED &&
      existingPost.status !== PostStatus.PUBLISHED
    ) {
      updateData.publishedAt = new Date();
    }

    const post = await this.prisma.post.update({
      where: { id },
      data: updateData,
    });

    // 태그 업데이트
    if (dto.tagIds) {
      // 기존 태그 연결 삭제
      await this.prisma.postTag.deleteMany({
        where: { postId: id },
      });

      // 새로운 태그 연결 생성
      if (dto.tagIds.length > 0) {
        const tagConnections = dto.tagIds.map((tagId) => ({
          id: uuidv4().replace(/-/g, ''),
          postId: id,
          tagId,
        }));

        await this.prisma.postTag.createMany({
          data: tagConnections,
        });
      }
    }

    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt || undefined,
      featuredImage: post.featuredImage || undefined,
      status: post.status as PostStatus,
      publishedAt: post.publishedAt?.toISOString() || undefined,
      authorId: post.authorId,
      categoryId: post.categoryId || undefined,
      viewCount: post.viewCount,
      isSticky: post.isSticky,
      isCommentable: post.isCommentable,
      metaTitle: post.metaTitle || undefined,
      metaDescription: post.metaDescription || undefined,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    };
  }

  async remove(id: string): Promise<PostDto> {
    // 게시글 존재 확인
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        comments: true,
        attachments: true,
      },
    });

    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    const deletedPost = await this.prisma.post.delete({
      where: { id },
    });

    return {
      id: deletedPost.id,
      title: deletedPost.title,
      slug: deletedPost.slug,
      content: deletedPost.content,
      excerpt: deletedPost.excerpt || undefined,
      featuredImage: deletedPost.featuredImage || undefined,
      status: deletedPost.status as PostStatus,
      publishedAt: deletedPost.publishedAt?.toISOString() || undefined,
      authorId: deletedPost.authorId,
      categoryId: deletedPost.categoryId || undefined,
      viewCount: deletedPost.viewCount,
      isSticky: deletedPost.isSticky,
      isCommentable: deletedPost.isCommentable,
      metaTitle: deletedPost.metaTitle || undefined,
      metaDescription: deletedPost.metaDescription || undefined,
      createdAt: deletedPost.createdAt.toISOString(),
      updatedAt: deletedPost.updatedAt.toISOString(),
    };
  }

  async incrementViewCount(id: string): Promise<void> {
    await this.prisma.post.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });
  }
}
