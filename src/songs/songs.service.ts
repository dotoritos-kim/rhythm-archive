import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateSongDto,
  UpdateSongDto,
  SongResponseDto,
  SongWithRelationsDto,
} from '../common/dto/song.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SongsService {
  constructor(private prisma: PrismaService) {}

  async create(createSongDto: CreateSongDto): Promise<SongResponseDto> {
    try {
      const song = await this.prisma.song.create({
        data: {
          id: uuidv4().replace(/-/g, ''),
          title: createSongDto.title,
          originalTitle: createSongDto.originalTitle,
        },
      });

      return this.mapToResponseDto(song);
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Song with this title already exists');
      }
      throw error;
    }
  }

  async findAll(
    includeRelations = false,
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    data: SongResponseDto[] | SongWithRelationsDto[];
    pagination: any;
  }> {
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Math.min(100, Number(limit) || 20));

    const skip = (pageNum - 1) * limitNum;

    const [songs, totalCount] = await Promise.all([
      this.prisma.song.findMany({
        where: {
          deletedAt: null,
        },
        include: includeRelations
          ? {
              songInfos: true,
              songComposers: {
                include: {
                  composer: true,
                },
              },
              songGameVersions: {
                include: {
                  game: true,
                  dlc: true,
                },
              },
              songTags: {
                include: {
                  tag: true,
                },
              },
            }
          : undefined,
        orderBy: {
          title: 'asc',
        },
        skip,
        take: limitNum,
      }),
      this.prisma.song.count({
        where: {
          deletedAt: null,
        },
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);
    const mappedSongs = songs.map((song) =>
      includeRelations
        ? this.mapToResponseWithRelationsDto(song)
        : this.mapToResponseDto(song),
    );

    return {
      data: mappedSongs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalCount,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
      },
    };
  }

  async findOne(
    id: string,
    includeRelations = false,
  ): Promise<SongResponseDto | SongWithRelationsDto> {
    const song = await this.prisma.song.findFirst({
      where: {
        id: id,
        deletedAt: null,
      },
      include: includeRelations
        ? {
            songInfos: true,
            songComposers: {
              include: {
                composer: true,
              },
            },
            songGameVersions: {
              include: {
                game: true,
                dlc: true,
              },
            },
            songTags: {
              include: {
                tag: true,
              },
            },
          }
        : undefined,
    });

    if (!song) {
      throw new NotFoundException(`Song with ID ${id} not found`);
    }

    return includeRelations
      ? this.mapToResponseWithRelationsDto(song)
      : this.mapToResponseDto(song);
  }

  async findByTitle(
    title: string,
    includeRelations = false,
  ): Promise<SongResponseDto | SongWithRelationsDto> {
    const song = await this.prisma.song.findFirst({
      where: {
        title: {
          contains: title,
        },
        deletedAt: null,
      },
      include: includeRelations
        ? {
            songInfos: true,
            songComposers: {
              include: {
                composer: true,
              },
            },
            songGameVersions: {
              include: {
                game: true,
                dlc: true,
              },
            },
            songTags: {
              include: {
                tag: true,
              },
            },
          }
        : undefined,
    });

    if (!song) {
      throw new NotFoundException(
        `Song with title containing "${title}" not found`,
      );
    }

    return includeRelations
      ? this.mapToResponseWithRelationsDto(song)
      : this.mapToResponseDto(song);
  }

  async update(
    id: string,
    updateSongDto: UpdateSongDto,
  ): Promise<SongResponseDto> {
    try {
      const song = await this.prisma.song.update({
        where: {
          id: id,
        },
        data: {
          title: updateSongDto.title,
          originalTitle: updateSongDto.originalTitle,
        },
      });

      return this.mapToResponseDto(song);
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Song with ID ${id} not found`);
      }
      if (error.code === 'P2002') {
        throw new ConflictException('Song with this title already exists');
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.song.update({
        where: {
          id: id,
        },
        data: {
          deletedAt: new Date(),
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Song with ID ${id} not found`);
      }
      throw error;
    }
  }

  async search(
    query: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: SongResponseDto[]; pagination: any }> {
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Math.min(100, Number(limit) || 20));

    const skip = (pageNum - 1) * limitNum;

    const [songs, totalCount] = await Promise.all([
      this.prisma.song.findMany({
        where: {
          OR: [
            {
              title: {
                contains: query,
              },
            },
            {
              originalTitle: {
                contains: query,
              },
            },
          ],
          deletedAt: null,
        },
        orderBy: {
          title: 'asc',
        },
        skip,
        take: limitNum,
      }),
      this.prisma.song.count({
        where: {
          OR: [
            {
              title: {
                contains: query,
              },
            },
            {
              originalTitle: {
                contains: query,
              },
            },
          ],
          deletedAt: null,
        },
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);
    const mappedSongs = songs.map((song) => this.mapToResponseDto(song));

    return {
      data: mappedSongs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalCount,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
      },
    };
  }

  private mapToResponseDto(song: any): SongResponseDto {
    return {
      id: song.id,
      title: song.title,
      originalTitle: song.originalTitle,
      createdAt: song.createdAt,
      updatedAt: song.updatedAt,
      deletedAt: song.deletedAt,
    };
  }

  private mapToResponseWithRelationsDto(song: any): SongWithRelationsDto {
    const base = this.mapToResponseDto(song);

    return {
      ...base,
      songInfos: song.songInfos?.map((info: any) => ({
        id: info.id,
        songId: info.songId,
        bpm: info.bpm ? Number(info.bpm) : undefined,
        beat: info.beat,
        lengthSec: info.lengthSec,
        extra: info.extra,
        createdAt: info.createdAt,
        updatedAt: info.updatedAt,
        deletedAt: info.deletedAt,
      })),
      songComposers: song.songComposers?.map((sc: any) => ({
        id: sc.id,
        songId: sc.songId,
        composerId: sc.composerId,
        composer: sc.composer
          ? {
              id: sc.composer.id,
              name: sc.composer.name,
              companyName: sc.composer.companyName,
              extra: sc.composer.extra,
              createdAt: sc.composer.createdAt,
              updatedAt: sc.composer.updatedAt,
              deletedAt: sc.composer.deletedAt,
            }
          : undefined,
        createdAt: sc.createdAt,
        updatedAt: sc.updatedAt,
        deletedAt: sc.deletedAt,
      })),
      songGameVersions: song.songGameVersions?.map((sgv: any) => ({
        id: sgv.id,
        songId: sgv.songId,
        gameId: sgv.gameId,
        dlcId: sgv.dlcId ? sgv.dlcId : undefined,
        inGameTitle: sgv.inGameTitle,
        bpmOverride: sgv.bpmOverride ? Number(sgv.bpmOverride) : undefined,
        lengthSec: sgv.lengthSec,
        arrangement: sgv.arrangement,
        firstVersion: sgv.firstVersion,
        firstDate: sgv.firstDate,
        extra: sgv.extra,
        createdAt: sgv.createdAt,
        updatedAt: sgv.updatedAt,
        deletedAt: sgv.deletedAt,
        game: sgv.game
          ? {
              id: sgv.game.id,
              name: sgv.game.name,
              releaseDate: sgv.game.releaseDate,
              publisher: sgv.game.publisher,
              extra: sgv.game.extra,
              createdAt: sgv.game.createdAt,
              updatedAt: sgv.game.updatedAt,
              deletedAt: sgv.game.deletedAt,
            }
          : undefined,
        dlc: sgv.dlc
          ? {
              id: sgv.dlc.id,
              gameId: sgv.dlc.gameId,
              dlcName: sgv.dlc.dlcName,
              releaseDate: sgv.dlc.releaseDate,
              extra: sgv.dlc.extra,
              createdAt: sgv.dlc.createdAt,
              updatedAt: sgv.dlc.updatedAt,
              deletedAt: sgv.dlc.deletedAt,
            }
          : undefined,
      })),
      songTags: song.songTags?.map((st: any) => ({
        id: st.id,
        songId: st.songId,
        tagId: st.tagId,
        tag: st.tag
          ? {
              id: st.tag.id,
              name: st.tag.name,
              createdAt: st.tag.createdAt,
              updatedAt: st.tag.updatedAt,
              deletedAt: st.tag.deletedAt,
            }
          : undefined,
        createdAt: st.createdAt,
        updatedAt: st.updatedAt,
        deletedAt: st.deletedAt,
      })),
    };
  }
}
