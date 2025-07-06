import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface SearchResult {
  songs: Array<{
    id: string;
    title: string;
    originalTitle?: string;
    composers: Array<{ name: string; companyName?: string }>;
    games: Array<{ name: string; inGameTitle?: string; dlcName?: string }>;
    tags: Array<{ name: string }>;
    bpm?: number;
    lengthSec?: number;
    score?: number; // 검색 관련도 점수
  }>;
  totalCount: number;
  searchTime: number;
  pagination?: {
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  // 통합 검색 (풀텍스트 검색 중심)
  async search(
    query: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<SearchResult> {
    const startTime = Date.now();

    if (!query || query.trim().length === 0) {
      return { songs: [], totalCount: 0, searchTime: 0 };
    }

    // page와 limit을 확실히 숫자로 변환
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Math.min(100, Number(limit) || 20));

    const trimmedQuery = query.trim();

    // 1. 풀텍스트 검색으로 곡 ID들을 찾기
    const songIds = await this.findSongIdsByFullText(trimmedQuery);

    // 2. 일반 검색으로 추가 곡 ID들을 찾기
    const additionalSongIds =
      await this.findSongIdsByNormalSearch(trimmedQuery);

    // 3. 모든 곡 ID를 합치고 중복 제거
    const allSongIds = [...new Set([...songIds, ...additionalSongIds])];

    if (allSongIds.length === 0) {
      return {
        songs: [],
        totalCount: 0,
        searchTime: Date.now() - startTime,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
    }

    // 4. 곡 상세 정보 조회
    const songs = await this.getSongsWithDetails(allSongIds);

    // 5. 검색 관련도 점수 계산
    const scoredSongs = this.calculateSearchScores(songs, trimmedQuery);

    // 6. 관련도 순으로 정렬
    scoredSongs.sort((a, b) => (b.score || 0) - (a.score || 0));

    // 페이지네이션 적용
    const totalCount = scoredSongs.length;
    const totalPages = Math.ceil(totalCount / limitNum);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedSongs = scoredSongs.slice(startIndex, endIndex);

    return {
      songs: paginatedSongs,
      totalCount,
      searchTime: Date.now() - startTime,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
      },
    };
  }

  // 풀텍스트 검색으로 곡 ID 찾기
  private async findSongIdsByFullText(query: string): Promise<string[]> {
    const results = await this.prisma.$queryRaw`
      SELECT DISTINCT s.id, 
             MATCH(s.title, s.original_title) AGAINST(${query} IN NATURAL LANGUAGE MODE) as relevance
      FROM songs s
      WHERE MATCH(s.title, s.original_title) AGAINST(${query} IN NATURAL LANGUAGE MODE)
        AND s.deletedAt IS NULL
      ORDER BY relevance DESC
      LIMIT 50
    `;

    return (results as any[]).map((r) => r.id);
  }

  // 일반 검색으로 곡 ID 찾기
  private async findSongIdsByNormalSearch(query: string): Promise<string[]> {
    const songs = await this.prisma.song.findMany({
      where: {
        OR: [
          { title: { contains: query } },
          { originalTitle: { contains: query } },
        ],
        deletedAt: null,
      },
      select: { id: true },
    });

    return songs.map((s) => s.id);
  }

  // 곡 상세 정보 조회
  private async getSongsWithDetails(songIds: string[]) {
    const songs = await this.prisma.song.findMany({
      where: {
        id: { in: songIds },
        deletedAt: null,
      },
      include: {
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
        songInfos: true,
        songTags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return songs.map((song) => ({
      id: song.id,
      title: song.title,
      originalTitle: song.originalTitle || undefined,
      composers: song.songComposers.map((sc) => ({
        name: sc.composer.name,
        companyName: sc.composer.companyName || undefined,
      })),
      games: song.songGameVersions.map((sgv) => ({
        name: sgv.game.name,
        inGameTitle: sgv.inGameTitle || undefined,
        dlcName: sgv.dlc?.dlcName || undefined,
      })),
      tags: song.songTags.map((st) => ({
        name: st.tag.name,
      })),
      bpm: song.songInfos?.bpm ? Number(song.songInfos.bpm) : undefined,
      lengthSec: song.songInfos?.lengthSec || undefined,
    }));
  }

  // 검색 관련도 점수 계산
  private calculateSearchScores(songs: any[], query: string): any[] {
    const queryLower = query.toLowerCase();

    return songs.map((song) => {
      let score = 0;

      // 제목 정확히 일치 (가장 높은 점수)
      if (song.title.toLowerCase() === queryLower) {
        score += 100;
      }
      // 제목에 검색어 포함
      else if (song.title.toLowerCase().includes(queryLower)) {
        score += 50;
      }

      // 원제목에 검색어 포함
      if (song.originalTitle?.toLowerCase().includes(queryLower)) {
        score += 30;
      }

      // 작곡가 이름에 검색어 포함
      song.composers.forEach((composer: any) => {
        if (composer.name.toLowerCase().includes(queryLower)) {
          score += 20;
        }
        if (composer.companyName?.toLowerCase().includes(queryLower)) {
          score += 10;
        }
      });

      // 게임 이름에 검색어 포함
      song.games.forEach((game: any) => {
        if (game.name.toLowerCase().includes(queryLower)) {
          score += 15;
        }
        if (game.inGameTitle?.toLowerCase().includes(queryLower)) {
          score += 10;
        }
        if (game.dlcName?.toLowerCase().includes(queryLower)) {
          score += 8;
        }
      });

      // 태그에 검색어 포함
      song.tags.forEach((tag: any) => {
        if (tag.name.toLowerCase().includes(queryLower)) {
          score += 5;
        }
      });

      return { ...song, score };
    });
  }

  // 풀텍스트 검색만 (디버깅용)
  async searchFullText(
    query: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<SearchResult> {
    const startTime = Date.now();

    if (!query || query.trim().length === 0) {
      return { songs: [], totalCount: 0, searchTime: 0 };
    }

    // page와 limit을 확실히 숫자로 변환
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Math.min(100, Number(limit) || 20));

    const songIds = await this.findSongIdsByFullText(query.trim());

    if (songIds.length === 0) {
      return {
        songs: [],
        totalCount: 0,
        searchTime: Date.now() - startTime,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
    }

    const songs = await this.getSongsWithDetails(songIds);
    const scoredSongs = this.calculateSearchScores(songs, query.trim());
    scoredSongs.sort((a, b) => (b.score || 0) - (a.score || 0));

    // 페이지네이션 적용
    const totalCount = scoredSongs.length;
    const totalPages = Math.ceil(totalCount / limitNum);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedSongs = scoredSongs.slice(startIndex, endIndex);

    return {
      songs: paginatedSongs,
      totalCount,
      searchTime: Date.now() - startTime,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
      },
    };
  }

  // 일반 검색만 (디버깅용)
  async searchAll(
    query: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<SearchResult> {
    const startTime = Date.now();

    if (!query || query.trim().length === 0) {
      return { songs: [], totalCount: 0, searchTime: 0 };
    }

    // page와 limit을 확실히 숫자로 변환
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Math.min(100, Number(limit) || 20));

    const songIds = await this.findSongIdsByNormalSearch(query.trim());

    if (songIds.length === 0) {
      return {
        songs: [],
        totalCount: 0,
        searchTime: Date.now() - startTime,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
    }

    const songs = await this.getSongsWithDetails(songIds);
    const scoredSongs = this.calculateSearchScores(songs, query.trim());
    scoredSongs.sort((a, b) => (b.score || 0) - (a.score || 0));

    // 페이지네이션 적용
    const totalCount = scoredSongs.length;
    const totalPages = Math.ceil(totalCount / limitNum);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedSongs = scoredSongs.slice(startIndex, endIndex);

    return {
      songs: paginatedSongs,
      totalCount,
      searchTime: Date.now() - startTime,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
      },
    };
  }
}
