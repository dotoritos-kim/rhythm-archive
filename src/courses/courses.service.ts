import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateCourseDto,
  UpdateCourseDto,
  CourseResponseDto,
} from '../dto/course.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async create(createCourseDto: CreateCourseDto): Promise<CourseResponseDto> {
    try {
      const course = await this.prisma.course.create({
        data: {
          id: uuidv4().replace(/-/g, ''),
          gameId: createCourseDto.gameId,
          dlcId: createCourseDto.dlcId,
          courseName: createCourseDto.courseName,
          difficulty: createCourseDto.difficulty,
          extra: createCourseDto.extra,
        },
      });

      return this.mapToResponseDto(course);
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          'Course with this gameId and courseName already exists',
        );
      }
      throw error;
    }
  }

  async findAll(): Promise<CourseResponseDto[]> {
    const courses = await this.prisma.course.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        courseName: 'asc',
      },
    });

    return courses.map((course) => this.mapToResponseDto(course));
  }

  async findOne(id: string): Promise<CourseResponseDto> {
    const course = await this.prisma.course.findFirst({
      where: {
        id: id,
        deletedAt: null,
      },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return this.mapToResponseDto(course);
  }

  async findByGameId(gameId: string): Promise<CourseResponseDto[]> {
    const courses = await this.prisma.course.findMany({
      where: {
        gameId: gameId,
        deletedAt: null,
      },
      orderBy: {
        courseName: 'asc',
      },
    });

    return courses.map((course) => this.mapToResponseDto(course));
  }

  async update(
    id: string,
    updateCourseDto: UpdateCourseDto,
  ): Promise<CourseResponseDto> {
    try {
      const course = await this.prisma.course.update({
        where: {
          id: id,
        },
        data: {
          gameId: updateCourseDto.gameId,
          dlcId: updateCourseDto.dlcId,
          courseName: updateCourseDto.courseName,
          difficulty: updateCourseDto.difficulty,
          extra: updateCourseDto.extra,
        },
      });

      return this.mapToResponseDto(course);
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Course with ID ${id} not found`);
      }
      if (error.code === 'P2002') {
        throw new ConflictException(
          'Course with this gameId and courseName already exists',
        );
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.course.update({
        where: {
          id: id,
        },
        data: {
          deletedAt: new Date(),
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Course with ID ${id} not found`);
      }
      throw error;
    }
  }

  async search(query: string): Promise<CourseResponseDto[]> {
    const courses = await this.prisma.course.findMany({
      where: {
        OR: [
          {
            courseName: {
              contains: query,
            },
          },
          {
            difficulty: {
              contains: query,
            },
          },
        ],
        deletedAt: null,
      },
      orderBy: {
        courseName: 'asc',
      },
    });

    return courses.map((course) => this.mapToResponseDto(course));
  }

  private mapToResponseDto(course: any): CourseResponseDto {
    return {
      id: course.id,
      gameId: course.gameId,
      dlcId: course.dlcId,
      courseName: course.courseName,
      difficulty: course.difficulty,
      extra: course.extra,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      deletedAt: course.deletedAt,
    };
  }
}
