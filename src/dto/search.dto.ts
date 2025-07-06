import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from './pagination.dto';

export class SearchQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  q?: string;
}

export class SearchResultDto {
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
