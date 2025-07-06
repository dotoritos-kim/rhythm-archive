import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FavoriteItemDto } from './dto/favorite-item.dto';
import { Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 사용자의 즐겨찾기 리스트 목록 조회
   */
  async getUserFavoriteLists(userId: string) {
    return await this.prisma.favoriteList.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 즐겨찾기 리스트 생성
   */
  async createFavoriteList(userId: string, name: string, description?: string) {
    return await this.prisma.favoriteList.create({
      data: {
        id: uuidv4().replace(/-/g, ''),
        userId,
        name,
        description,
        isPublic: false,
        isDefault: false,
      },
    });
  }

  /**
   * 즐겨찾기 리스트 수정
   */
  async updateFavoriteList(
    userId: string,
    listId: string,
    data: { name?: string; description?: string },
  ) {
    return await this.prisma.favoriteList.update({
      where: { id: listId, userId },
      data,
    });
  }

  /**
   * 즐겨찾기 리스트 삭제
   */
  async deleteFavoriteList(userId: string, listId: string) {
    // 먼저 리스트의 모든 아이템 삭제
    await this.prisma.favoriteItem.deleteMany({
      where: { favoriteListId: listId },
    });

    // 리스트 삭제
    return await this.prisma.favoriteList.delete({
      where: { id: listId, userId },
    });
  }

  /**
   * 즐겨찾기 아이템 추가
   */
  async addFavoriteItem(
    userId: string,
    listId: string,
    itemType: string,
    itemId: string,
    order?: number,
    metadata?: any,
  ) {
    // 리스트가 사용자의 것인지 확인
    const list = await this.prisma.favoriteList.findFirst({
      where: { id: listId, userId },
    });
    if (!list) {
      throw new Error('즐겨찾기 리스트를 찾을 수 없습니다');
    }

    // 아이템 제목 가져오기
    let title = '';
    if (itemType === 'song') {
      const song = await this.prisma.song.findUnique({ where: { id: itemId } });
      title = song?.title || '';
    } else if (itemType === 'chart') {
      const chart = await this.prisma.chart.findUnique({
        where: { id: itemId },
      });
      title = chart?.difficultyName || '';
    } else if (itemType === 'game') {
      const game = await this.prisma.game.findUnique({ where: { id: itemId } });
      title = game?.name || '';
    } else if (itemType === 'course') {
      const course = await this.prisma.course.findUnique({
        where: { id: itemId },
      });
      title = course?.courseName || '';
    }

    return await this.prisma.favoriteItem.create({
      data: {
        id: uuidv4().replace(/-/g, ''),
        favoriteListId: listId,
        itemType,
        itemId,
        title,
        order: order || 0,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  }

  /**
   * 즐겨찾기 아이템 제거
   */
  async removeFavoriteItem(userId: string, listId: string, itemId: string) {
    // 리스트가 사용자의 것인지 확인
    const list = await this.prisma.favoriteList.findFirst({
      where: { id: listId, userId },
    });
    if (!list) {
      throw new Error('즐겨찾기 리스트를 찾을 수 없습니다');
    }

    return await this.prisma.favoriteItem.delete({
      where: { id: itemId, favoriteListId: listId },
    });
  }

  // CRUD 및 검색 메서드는 이후 추가

  /**
   * 즐겨찾기 리스트와 상세 아이템 정보 반환
   */
  async getFavoriteListWithItems(
    userId: string,
    listId: string,
  ): Promise<{
    id: string;
    name: string;
    description?: string;
    isPublic: boolean;
    isDefault: boolean;
    items: FavoriteItemDto[];
  } | null> {
    console.log('[FavoritesService] getFavoriteListWithItems 호출됨');
    console.log('[FavoritesService] userId:', userId);
    console.log('[FavoritesService] listId:', listId);

    // 즐겨찾기 리스트 및 아이템 조회
    const list = await this.prisma.favoriteList.findUnique({
      where: { id: listId, userId },
      include: {
        items: true,
      },
    });

    console.log('[FavoritesService] 조회된 리스트:', list);

    if (!list) {
      console.log('[FavoritesService] 리스트를 찾을 수 없음');
      return null;
    }

    console.log('[FavoritesService] 리스트 아이템 수:', list.items.length);

    // 각 아이템의 상세 정보 join
    const items: FavoriteItemDto[] = await Promise.all(
      list.items.map(async (item) => {
        let songInfo: FavoriteItemDto['songInfo'] = null;
        let chartInfo: FavoriteItemDto['chartInfo'] = null;
        let gameInfo: FavoriteItemDto['gameInfo'] = null;
        let courseInfo: FavoriteItemDto['courseInfo'] = null;
        if (item.itemType === 'song') {
          const song = await this.prisma.song.findUnique({
            where: { id: item.itemId },
            include: {
              songInfos: true,
              songComposers: { include: { composer: true } },
            },
          });
          if (song) {
            songInfo = {
              id: song.id,
              title: song.title,
              artist: song.songComposers
                ?.map((sc) => sc.composer.name)
                .join(', '),
              bpm: song.songInfos?.bpm ? Number(song.songInfos.bpm) : undefined,
              lengthSec: song.songInfos?.lengthSec ?? undefined,
              // 기타 곡 정보 필요시 추가
            };
          }
        } else if (item.itemType === 'chart') {
          const chart = await this.prisma.chart.findUnique({
            where: { id: item.itemId },
            include: {
              songGameVersion: { include: { song: true } },
            },
          });
          if (chart) {
            chartInfo = {
              id: chart.id,
              songId: chart.sgvId,
              difficultyName: chart.difficultyName,
              level: Number(chart.level),
              noteCount: chart.noteCount ?? undefined,
              songTitle: chart.songGameVersion?.song?.title,
            };
          }
        } else if (item.itemType === 'game') {
          const game = await this.prisma.game.findUnique({
            where: { id: item.itemId },
          });
          if (game) {
            gameInfo = {
              id: game.id,
              name: game.name,
            };
          }
        } else if (item.itemType === 'course') {
          const course = await this.prisma.course.findUnique({
            where: { id: item.itemId },
          });
          if (course) {
            courseInfo = {
              id: course.id,
              courseName: course.courseName,
            };
          }
        }
        return {
          id: item.id,
          itemType: item.itemType as any,
          itemId: item.itemId,
          title: item.title,
          description: item.description ?? undefined,
          order: item.order,
          metadata: item.metadata ? JSON.parse(item.metadata) : undefined,
          songInfo,
          chartInfo,
          gameInfo,
          courseInfo,
        };
      }),
    );
    return {
      id: list.id,
      name: list.name,
      description: list.description ?? undefined,
      isPublic: list.isPublic,
      isDefault: list.isDefault,
      items,
    };
  }
}
