import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTagDto, UpdateTagDto, TagResponseDto } from '../dto/tag.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TagsService {
  constructor(private prisma: PrismaService) {}

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9가-힣]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  async create(createTagDto: CreateTagDto): Promise<TagResponseDto> {
    try {
      const slug = this.generateSlug(createTagDto.name);

      const tag = await this.prisma.tag.create({
        data: {
          id: uuidv4().replace(/-/g, ''),
          name: createTagDto.name,
          slug: slug,
        },
      });

      return this.mapToResponseDto(tag);
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Tag with this name already exists');
      }
      throw error;
    }
  }

  async findAll(): Promise<TagResponseDto[]> {
    const tags = await this.prisma.tag.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return tags.map((tag) => this.mapToResponseDto(tag));
  }

  async findOne(id: string): Promise<TagResponseDto> {
    const tag = await this.prisma.tag.findFirst({
      where: {
        id: id,
        deletedAt: null,
      },
    });

    if (!tag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }

    return this.mapToResponseDto(tag);
  }

  async findByName(name: string): Promise<TagResponseDto> {
    const tag = await this.prisma.tag.findFirst({
      where: {
        name: {
          contains: name,
        },
        deletedAt: null,
      },
    });

    if (!tag) {
      throw new NotFoundException(
        `Tag with name containing "${name}" not found`,
      );
    }

    return this.mapToResponseDto(tag);
  }

  async update(
    id: string,
    updateTagDto: UpdateTagDto,
  ): Promise<TagResponseDto> {
    try {
      const updateData: any = {};

      if (updateTagDto.name) {
        updateData.name = updateTagDto.name;
        updateData.slug = this.generateSlug(updateTagDto.name);
      }

      const tag = await this.prisma.tag.update({
        where: {
          id: id,
        },
        data: updateData,
      });

      return this.mapToResponseDto(tag);
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Tag with ID ${id} not found`);
      }
      if (error.code === 'P2002') {
        throw new ConflictException('Tag with this name already exists');
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.tag.update({
        where: {
          id: id,
        },
        data: {
          deletedAt: new Date(),
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Tag with ID ${id} not found`);
      }
      throw error;
    }
  }

  async search(query: string): Promise<TagResponseDto[]> {
    const tags = await this.prisma.tag.findMany({
      where: {
        name: {
          contains: query,
        },
        deletedAt: null,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return tags.map((tag) => this.mapToResponseDto(tag));
  }

  private mapToResponseDto(tag: any): TagResponseDto {
    return {
      id: tag.id,
      name: tag.name,
      createdAt: tag.createdAt,
      updatedAt: tag.updatedAt,
      deletedAt: tag.deletedAt,
    };
  }
}
