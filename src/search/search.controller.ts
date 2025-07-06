import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SearchService, SearchResult } from './search.service';
import { SearchQueryDto, SearchResultDto } from '../dto/search.dto';

@ApiTags('검색')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({
    summary: '통합 검색',
    description: '모든 관련 데이터에서 검색을 수행합니다.',
  })
  @ApiQuery({
    name: 'q',
    required: true,
    description: '검색할 키워드',
    example: '리듬게임',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: '페이지 번호',
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: '페이지당 아이템 수',
    type: Number,
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: '검색 결과를 성공적으로 조회했습니다.',
    type: SearchResultDto,
  })
  @ApiResponse({
    status: 400,
    description: '검색어가 비어있습니다.',
  })
  async search(@Query() query: SearchQueryDto): Promise<SearchResultDto> {
    if (!query.q || query.q.trim().length === 0) {
      return { songs: [], totalCount: 0, searchTime: 0 };
    }

    return await this.searchService.search(
      query.q.trim(),
      query.page || 1,
      query.limit || 20,
    );
  }

  @Get('all')
  @ApiOperation({
    summary: '전체 검색',
    description: '모든 테이블에서 포괄적으로 검색을 수행합니다.',
  })
  @ApiQuery({
    name: 'q',
    required: true,
    description: '검색할 키워드',
    example: '리듬게임',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: '페이지 번호',
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: '페이지당 아이템 수',
    type: Number,
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: '전체 검색 결과를 성공적으로 조회했습니다.',
    type: SearchResultDto,
  })
  @ApiResponse({
    status: 400,
    description: '검색어가 비어있습니다.',
  })
  async searchAll(@Query() query: SearchQueryDto): Promise<SearchResultDto> {
    if (!query.q || query.q.trim().length === 0) {
      return { songs: [], totalCount: 0, searchTime: 0 };
    }

    return await this.searchService.searchAll(
      query.q.trim(),
      query.page || 1,
      query.limit || 20,
    );
  }

  @Get('fulltext')
  @ApiOperation({
    summary: '전문 검색',
    description: '데이터베이스의 전문 검색 기능을 사용하여 검색을 수행합니다.',
  })
  @ApiQuery({
    name: 'q',
    required: true,
    description: '검색할 키워드',
    example: '리듬게임',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: '페이지 번호',
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: '페이지당 아이템 수',
    type: Number,
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: '전문 검색 결과를 성공적으로 조회했습니다.',
    type: SearchResultDto,
  })
  @ApiResponse({
    status: 400,
    description: '검색어가 비어있습니다.',
  })
  async searchFullText(
    @Query() query: SearchQueryDto,
  ): Promise<SearchResultDto> {
    if (!query.q || query.q.trim().length === 0) {
      return { songs: [], totalCount: 0, searchTime: 0 };
    }

    return await this.searchService.searchFullText(
      query.q.trim(),
      query.page || 1,
      query.limit || 20,
    );
  }
}
