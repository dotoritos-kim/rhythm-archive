import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCmsTagDto, UpdateCmsTagDto, TagDto } from '../dto/cms.dto';
import { v4 as uuidv4 } from 'uuid';

interface TagQuery {
  name?: string;
}

@Injectable()
export class TagsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: TagQuery): Promise<TagDto[]> {
    const { name } = query;

    const where: Record<string, unknown> = {};

    if (name) {
      where.name = {
        contains: name,
        mode: 'insensitive',
      };
    }

    const tags = await this.prisma.tag.findMany({
      where,
      orderBy: [{ name: 'asc' }, { createdAt: 'desc' }],
    });

    return tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      description: tag.description || undefined,
      createdAt: tag.createdAt.toISOString(),
      updatedAt: tag.updatedAt.toISOString(),
    }));
  }

  async findOne(id: string): Promise<TagDto> {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
    });

    if (!tag) {
      throw new NotFoundException('태그를 찾을 수 없습니다.');
    }

    return {
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      description: tag.description || undefined,
      createdAt: tag.createdAt.toISOString(),
      updatedAt: tag.updatedAt.toISOString(),
    };
  }

  async create(dto: CreateCmsTagDto): Promise<TagDto> {
    // 슬러그 중복 확인
    const existingTag = await this.prisma.tag.findUnique({
      where: { slug: dto.slug },
    });

    if (existingTag) {
      throw new BadRequestException('이미 존재하는 슬러그입니다.');
    }

    // 기본값 설정
    const data = {
      id: uuidv4().replace(/-/g, ''),
      name: dto.name,
      slug: dto.slug,
      description: dto.description || null,
    };

    const tag = await this.prisma.tag.create({
      data,
    });

    return {
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      description: tag.description || undefined,
      createdAt: tag.createdAt.toISOString(),
      updatedAt: tag.updatedAt.toISOString(),
    };
  }

  async update(id: string, dto: UpdateCmsTagDto): Promise<TagDto> {
    // 태그 존재 확인
    const existingTag = await this.prisma.tag.findUnique({
      where: { id },
    });

    if (!existingTag) {
      throw new NotFoundException('태그를 찾을 수 없습니다.');
    }

    // 슬러그 중복 확인 (자신 제외)
    if (dto.slug) {
      const duplicateSlug = await this.prisma.tag.findFirst({
        where: {
          slug: dto.slug,
          id: { not: id },
        },
      });

      if (duplicateSlug) {
        throw new BadRequestException('이미 존재하는 슬러그입니다.');
      }
    }

    const tag = await this.prisma.tag.update({
      where: { id },
      data: dto,
    });

    return {
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      description: tag.description || undefined,
      createdAt: tag.createdAt.toISOString(),
      updatedAt: tag.updatedAt.toISOString(),
    };
  }

  async remove(id: string): Promise<TagDto> {
    // 태그 존재 확인
    const tag = await this.prisma.tag.findUnique({
      where: { id },
      include: {
        posts: true,
      },
    });

    if (!tag) {
      throw new NotFoundException('태그를 찾을 수 없습니다.');
    }

    // 게시글이 있는지 확인
    if (tag.posts.length > 0) {
      throw new BadRequestException('게시글이 있는 태그는 삭제할 수 없습니다.');
    }

    const deletedTag = await this.prisma.tag.delete({
      where: { id },
    });

    return {
      id: deletedTag.id,
      name: deletedTag.name,
      slug: deletedTag.slug,
      description: deletedTag.description || undefined,
      createdAt: deletedTag.createdAt.toISOString(),
      updatedAt: deletedTag.updatedAt.toISOString(),
    };
  }
}
