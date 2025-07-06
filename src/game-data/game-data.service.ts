import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GameDataDto, SongDataDto } from '../dto/game-data.dto';
import * as crypto from 'crypto';
import { Prisma } from '@prisma/client';

@Injectable()
export class GameDataService {
  constructor(private prisma: PrismaService) {}

  async addGameData(gameData: GameDataDto) {
    const { game, songs } = gameData;

    // 트랜잭션으로 모든 데이터를 안전하게 추가
    return await this.prisma.$transaction(async (tx) => {
      // 1. 게임 생성 또는 조회
      let gameRecord = await tx.game.findUnique({
        where: { name: game.name },
      });

      if (!gameRecord) {
        gameRecord = await tx.game.create({
          data: {
            id: crypto.randomUUID().replace(/-/g, ''),
            name: game.name,
            releaseDate: game.releaseDate ? new Date(game.releaseDate) : null,
            publisher: game.publisher,
            extra: game.extra,
          },
        });
      }

      const results: {
        game: any;
        songs: Array<{
          song: any;
          composers: any[];
          gameVersions: any[];
          tags: any[];
        }>;
        composers: any[];
        dlcs: any[];
        charts: any[];
      } = {
        game: gameRecord,
        songs: [],
        composers: [],
        dlcs: [],
        charts: [],
      };

      // 2. 각 곡 처리
      for (const songData of songs) {
        const songResult = await this.processSong(tx, songData, gameRecord.id);
        results.songs.push(songResult);
      }

      return results;
    });
  }

  private async processSong(
    tx: Prisma.TransactionClient,
    songData: SongDataDto,
    gameId: string,
  ) {
    // 1. 곡 생성 또는 조회
    let song = await tx.song.findFirst({
      where: { title: songData.title },
    });

    if (!song) {
      song = await tx.song.create({
        data: {
          id: crypto.randomUUID().replace(/-/g, ''),
          title: songData.title,
          originalTitle: songData.originalTitle,
        },
      });
    }

    // 2. 곡 정보 생성 또는 업데이트
    if (songData.songInfo) {
      await tx.songInfo.upsert({
        where: { songId: song.id },
        update: {
          bpm: songData.songInfo.bpm,
          beat: songData.songInfo.beat,
          lengthSec: songData.songInfo.lengthSec,
          extra: songData.songInfo.extra,
        },
        create: {
          id: crypto.randomUUID().replace(/-/g, ''),
          songId: song.id,
          bpm: songData.songInfo.bpm,
          beat: songData.songInfo.beat,
          lengthSec: songData.songInfo.lengthSec,
          extra: songData.songInfo.extra,
        },
      });
    }

    // 3. 작곡가 처리
    const composers: any[] = [];
    if (songData.composers) {
      for (const composerData of songData.composers) {
        const composer = await this.processComposer(tx, composerData);
        composers.push(composer);

        // 곡-작곡가 관계 생성
        await tx.songComposer.upsert({
          where: {
            songId_composerId: {
              songId: song.id,
              composerId: composer.id,
            },
          },
          update: {},
          create: {
            id: crypto.randomUUID().replace(/-/g, ''),
            songId: song.id,
            composerId: composer.id,
          },
        });
      }
    }

    // 4. 게임 버전 처리
    const gameVersions: any[] = [];
    for (const versionData of songData.gameVersions) {
      const gameVersion = await this.processGameVersion(
        tx,
        versionData,
        song.id,
        gameId,
      );
      gameVersions.push(gameVersion);
    }

    // 5. 태그 처리
    const tags: any[] = [];
    if (songData.tags) {
      for (const tagName of songData.tags) {
        const tag = await this.processTag(tx, tagName);
        tags.push(tag);

        // 곡-태그 관계 생성
        await tx.songTag.upsert({
          where: {
            songId_tagId: {
              songId: song.id,
              tagId: tag.id,
            },
          },
          update: {},
          create: {
            id: crypto.randomUUID().replace(/-/g, ''),
            songId: song.id,
            tagId: tag.id,
          },
        });
      }
    }

    return {
      song,
      composers,
      gameVersions,
      tags,
    };
  }

  private async processComposer(
    tx: Prisma.TransactionClient,
    composerData: any,
  ) {
    // name+companyName으로 조회 후 없으면 생성
    let composer: any = null;

    if (composerData.companyName) {
      // companyName이 있는 경우 composite unique constraint 사용
      composer = await tx.composer.findUnique({
        where: {
          name_companyName: {
            name: composerData.name,
            companyName: composerData.companyName,
          },
        },
      });
    } else {
      // companyName이 없는 경우 name으로만 조회
      composer = await tx.composer.findFirst({
        where: {
          name: composerData.name,
          companyName: null,
        },
      });
    }

    if (!composer) {
      composer = await tx.composer.create({
        data: {
          id: crypto.randomUUID().replace(/-/g, ''),
          name: composerData.name,
          companyName: composerData.companyName,
          extra: composerData.extra,
        },
      });
    }
    return composer;
  }

  private async processGameVersion(
    tx: Prisma.TransactionClient,
    versionData: any,
    songId: string,
    gameId: string,
  ) {
    // DLC 처리
    let dlc: any = null;
    if (versionData.dlcName) {
      dlc = await tx.dlc.upsert({
        where: {
          gameId_dlcName: {
            gameId: gameId,
            dlcName: versionData.dlcName,
          },
        },
        update: {
          releaseDate: versionData.dlcReleaseDate
            ? new Date(versionData.dlcReleaseDate)
            : null,
        },
        create: {
          id: crypto.randomUUID().replace(/-/g, ''),
          gameId: gameId,
          dlcName: versionData.dlcName,
          releaseDate: versionData.dlcReleaseDate
            ? new Date(versionData.dlcReleaseDate)
            : null,
        },
      });
    }

    // 게임 버전 생성
    const gameVersion = await tx.songGameVersion.create({
      data: {
        id: crypto.randomUUID().replace(/-/g, ''),
        songId: songId,
        gameId: gameId,
        dlcId: dlc?.id ? dlc.id : null,
        inGameTitle: versionData.inGameTitle,
        bpmOverride: versionData.bpmOverride,
        lengthSec: versionData.lengthSec,
        arrangement: versionData.arrangement,
        firstVersion: versionData.firstVersion,
        firstDate: versionData.firstDate
          ? new Date(versionData.firstDate)
          : null,
        extra: versionData.extra,
      },
    });

    // 차트 처리
    const charts: any[] = [];
    for (const chartData of versionData.charts) {
      const chart = await tx.chart.create({
        data: {
          id: crypto.randomUUID().replace(/-/g, ''),
          sgvId: gameVersion.id,
          difficultyName: chartData.difficultyName,
          level: chartData.level,
          noteCount: chartData.noteCount,
          chartType: chartData.chartType,
          extra: chartData.extra,
        },
      });
      charts.push(chart);
    }

    return {
      gameVersion,
      dlc,
      charts,
    };
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9가-힣]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private async processTag(tx: Prisma.TransactionClient, tagName: string) {
    let tag = await tx.songTagItem.findUnique({ where: { name: tagName } });
    if (!tag) {
      tag = await tx.songTagItem.create({
        data: {
          id: crypto.randomUUID().replace(/-/g, ''),
          name: tagName,
        },
      });
    }
    return tag;
  }

  async getGameData(gameName: string) {
    const game = await this.prisma.game.findUnique({
      where: { name: gameName },
      include: {
        dlcs: true,
        songGameVersions: {
          include: {
            song: {
              include: {
                songInfos: true,
                songComposers: {
                  include: {
                    composer: true,
                  },
                },
                songTags: {
                  include: {
                    tag: true,
                  },
                },
              },
            },
            charts: true,
            dlc: true,
          },
        },
      },
    });

    if (!game) {
      throw new NotFoundException(`게임 '${gameName}'을 찾을 수 없습니다.`);
    }

    return game;
  }
}
