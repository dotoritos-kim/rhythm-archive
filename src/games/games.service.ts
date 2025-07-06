import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGameDto, UpdateGameDto, GameResponseDto } from '../dto/game.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class GamesService {
  constructor(private prisma: PrismaService) {}

  async create(createGameDto: CreateGameDto): Promise<GameResponseDto> {
    try {
      const game = await this.prisma.game.create({
        data: {
          id: uuidv4().replace(/-/g, ''),
          name: createGameDto.name,
          releaseDate: createGameDto.releaseDate,
          publisher: createGameDto.publisher,
          extra: createGameDto.extra,
        },
      });

      return this.mapToResponseDto(game);
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Game with this name already exists');
      }
      throw error;
    }
  }

  async findAll(): Promise<GameResponseDto[]> {
    const games = await this.prisma.game.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return games.map((game) => this.mapToResponseDto(game));
  }

  async findOne(id: string): Promise<GameResponseDto> {
    const game = await this.prisma.game.findFirst({
      where: {
        id: id,
        deletedAt: null,
      },
    });

    if (!game) {
      throw new NotFoundException(`Game with ID ${id} not found`);
    }

    return this.mapToResponseDto(game);
  }

  async findByName(name: string): Promise<GameResponseDto> {
    const game = await this.prisma.game.findFirst({
      where: {
        name: {
          contains: name,
        },
        deletedAt: null,
      },
    });

    if (!game) {
      throw new NotFoundException(
        `Game with name containing "${name}" not found`,
      );
    }

    return this.mapToResponseDto(game);
  }

  async update(
    id: string,
    updateGameDto: UpdateGameDto,
  ): Promise<GameResponseDto> {
    try {
      const game = await this.prisma.game.update({
        where: {
          id: id,
        },
        data: {
          name: updateGameDto.name,
          releaseDate: updateGameDto.releaseDate,
          publisher: updateGameDto.publisher,
          extra: updateGameDto.extra,
        },
      });

      return this.mapToResponseDto(game);
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Game with ID ${id} not found`);
      }
      if (error.code === 'P2002') {
        throw new ConflictException('Game with this name already exists');
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.game.update({
        where: {
          id: id,
        },
        data: {
          deletedAt: new Date(),
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Game with ID ${id} not found`);
      }
      throw error;
    }
  }

  async search(query: string): Promise<GameResponseDto[]> {
    const games = await this.prisma.game.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query,
            },
          },
          {
            publisher: {
              contains: query,
            },
          },
        ],
        deletedAt: null,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return games.map((game) => this.mapToResponseDto(game));
  }

  private mapToResponseDto(game: any): GameResponseDto {
    return {
      id: game.id,
      name: game.name,
      releaseDate: game.releaseDate,
      publisher: game.publisher,
      extra: game.extra,
      createdAt: game.createdAt,
      updatedAt: game.updatedAt,
      deletedAt: game.deletedAt,
    };
  }
}
