import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryDto,
} from '../dto/cms.dto';
import { v4 as uuidv4 } from 'uuid';

interface CategoryQuery {
  name?: string;
  parentId?: string;
}

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: CategoryQuery): Promise<CategoryDto[]> {
    const { name, parentId } = query;

    const where: Record<string, unknown> = {};

    if (name) {
      where.name = {
        contains: name,
        mode: 'insensitive',
      };
    }

    if (parentId) {
      where.parentId = parentId;
    }

    const categories = await this.prisma.category.findMany({
      where,
      include: {
        parent: true,
        children: true,
      },
      orderBy: [{ order: 'asc' }, { name: 'asc' }, { createdAt: 'desc' }],
    });

    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description || undefined,
      parentId: category.parentId || undefined,
      order: category.order,
      isActive: category.isActive,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    }));
  }

  async findOne(id: string): Promise<CategoryDto> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
      },
    });

    if (!category) {
      throw new NotFoundException('카테고리를 찾을 수 없습니다.');
    }

    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description || undefined,
      parentId: category.parentId || undefined,
      order: category.order,
      isActive: category.isActive,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    };
  }

  async create(dto: CreateCategoryDto): Promise<CategoryDto> {
    // 슬러그 중복 확인
    const existingCategory = await this.prisma.category.findUnique({
      where: { slug: dto.slug },
    });

    if (existingCategory) {
      throw new BadRequestException('이미 존재하는 슬러그입니다.');
    }

    // 상위 카테고리 존재 확인
    if (dto.parentId) {
      const parentCategory = await this.prisma.category.findUnique({
        where: { id: dto.parentId },
      });

      if (!parentCategory) {
        throw new BadRequestException('상위 카테고리를 찾을 수 없습니다.');
      }
    }

    // 기본값 설정
    const data = {
      id: uuidv4().replace(/-/g, ''),
      name: dto.name,
      slug: dto.slug,
      description: dto.description || null,
      parentId: dto.parentId || null,
      order: dto.order || 0,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
    };

    const category = await this.prisma.category.create({
      data,
    });

    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description || undefined,
      parentId: category.parentId || undefined,
      order: category.order,
      isActive: category.isActive,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    };
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<CategoryDto> {
    // 카테고리 존재 확인
    const existingCategory = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      throw new NotFoundException('카테고리를 찾을 수 없습니다.');
    }

    // 슬러그 중복 확인 (자신 제외)
    if (dto.slug) {
      const duplicateSlug = await this.prisma.category.findFirst({
        where: {
          slug: dto.slug,
          id: { not: id },
        },
      });

      if (duplicateSlug) {
        throw new BadRequestException('이미 존재하는 슬러그입니다.');
      }
    }

    // 상위 카테고리 존재 확인
    if (dto.parentId) {
      const parentCategory = await this.prisma.category.findUnique({
        where: { id: dto.parentId },
      });

      if (!parentCategory) {
        throw new BadRequestException('상위 카테고리를 찾을 수 없습니다.');
      }

      // 자기 자신을 상위 카테고리로 설정하는 것 방지
      if (dto.parentId === id) {
        throw new BadRequestException(
          '자기 자신을 상위 카테고리로 설정할 수 없습니다.',
        );
      }
    }

    const category = await this.prisma.category.update({
      where: { id },
      data: dto,
    });

    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description || undefined,
      parentId: category.parentId || undefined,
      order: category.order,
      isActive: category.isActive,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    };
  }

  async remove(id: string): Promise<CategoryDto> {
    // 카테고리 존재 확인
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        children: true,
        posts: true,
      },
    });

    if (!category) {
      throw new NotFoundException('카테고리를 찾을 수 없습니다.');
    }

    // 하위 카테고리가 있는지 확인
    if (category.children.length > 0) {
      throw new BadRequestException(
        '하위 카테고리가 있는 카테고리는 삭제할 수 없습니다.',
      );
    }

    // 게시글이 있는지 확인
    if (category.posts.length > 0) {
      throw new BadRequestException(
        '게시글이 있는 카테고리는 삭제할 수 없습니다.',
      );
    }

    const deletedCategory = await this.prisma.category.delete({
      where: { id },
    });

    return {
      id: deletedCategory.id,
      name: deletedCategory.name,
      slug: deletedCategory.slug,
      description: deletedCategory.description || undefined,
      parentId: deletedCategory.parentId || undefined,
      order: deletedCategory.order,
      isActive: deletedCategory.isActive,
      createdAt: deletedCategory.createdAt.toISOString(),
      updatedAt: deletedCategory.updatedAt.toISOString(),
    };
  }
}
