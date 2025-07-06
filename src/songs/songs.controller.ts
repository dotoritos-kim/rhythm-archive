import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { SongsService } from './songs.service';
import {
  CreateSongDto,
  UpdateSongDto,
  SongResponseDto,
  SongWithRelationsDto,
} from '../common/dto/song.dto';
import {
  PaginationQueryDto,
  PaginationResponseDto,
} from '../dto/pagination.dto';

@ApiTags('songs')
@Controller('songs')
export class SongsController {
  constructor(private readonly songsService: SongsService) {}

  @Post()
  @ApiOperation({
    summary: '새 곡 생성',
    description: '새로운 곡을 생성합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '곡이 성공적으로 생성되었습니다.',
    type: SongResponseDto,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청입니다.' })
  create(@Body() createSongDto: CreateSongDto): Promise<SongResponseDto> {
    return this.songsService.create(createSongDto);
  }

  @Get()
  @ApiOperation({
    summary: '모든 곡 조회',
    description: '모든 곡 목록을 조회합니다.',
  })
  @ApiQuery({
    name: 'includeRelations',
    required: false,
    description: '관계 데이터 포함 여부',
    type: Boolean,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: '페이지 번호',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: '페이지당 아이템 수',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: '곡 목록을 성공적으로 조회했습니다.',
    type: [SongResponseDto],
  })
  findAll(
    @Query('includeRelations') includeRelations?: string,
    @Query() pagination?: PaginationQueryDto,
  ): Promise<PaginationResponseDto<SongResponseDto | SongWithRelationsDto>> {
    const include = includeRelations === 'true';
    return this.songsService.findAll(
      include,
      pagination?.page || 1,
      pagination?.limit || 20,
    );
  }

  @Get('search')
  @ApiOperation({
    summary: '곡 검색',
    description: '제목으로 곡을 검색합니다.',
  })
  @ApiQuery({ name: 'q', required: true, description: '검색할 제목' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: '페이지 번호',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: '페이지당 아이템 수',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: '검색 결과를 성공적으로 조회했습니다.',
    type: [SongResponseDto],
  })
  search(
    @Query('q') query: string,
    @Query() pagination?: PaginationQueryDto,
  ): Promise<PaginationResponseDto<SongResponseDto>> {
    return this.songsService.search(
      query,
      pagination?.page || 1,
      pagination?.limit || 20,
    );
  }

  @Get('title/:title')
  @ApiOperation({
    summary: '제목으로 곡 조회',
    description: '제목으로 특정 곡을 조회합니다.',
  })
  @ApiParam({ name: 'title', description: '조회할 곡의 제목' })
  @ApiQuery({
    name: 'includeRelations',
    required: false,
    description: '관계 데이터 포함 여부',
    type: Boolean,
  })
  @ApiResponse({
    status: 200,
    description: '곡을 성공적으로 조회했습니다.',
    type: SongResponseDto,
  })
  @ApiResponse({ status: 404, description: '곡을 찾을 수 없습니다.' })
  findByTitle(
    @Param('title') title: string,
    @Query('includeRelations') includeRelations?: string,
  ): Promise<SongResponseDto | SongWithRelationsDto> {
    const include = includeRelations === 'true';
    return this.songsService.findByTitle(title, include);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'ID로 곡 조회',
    description: 'ID로 특정 곡을 조회합니다.',
  })
  @ApiParam({ name: 'id', description: '조회할 곡의 ID' })
  @ApiQuery({
    name: 'includeRelations',
    required: false,
    description: '관계 데이터 포함 여부',
    type: Boolean,
  })
  @ApiResponse({
    status: 200,
    description: '곡을 성공적으로 조회했습니다.',
    type: SongResponseDto,
  })
  @ApiResponse({ status: 404, description: '곡을 찾을 수 없습니다.' })
  findOne(
    @Param('id') id: string,
    @Query('includeRelations') includeRelations?: string,
  ): Promise<SongResponseDto | SongWithRelationsDto> {
    const include = includeRelations === 'true';
    return this.songsService.findOne(id, include);
  }

  @Patch(':id')
  @ApiOperation({
    summary: '곡 수정',
    description: '특정 곡의 정보를 수정합니다.',
  })
  @ApiParam({ name: 'id', description: '수정할 곡의 ID' })
  @ApiResponse({
    status: 200,
    description: '곡이 성공적으로 수정되었습니다.',
    type: SongResponseDto,
  })
  @ApiResponse({ status: 404, description: '곡을 찾을 수 없습니다.' })
  update(
    @Param('id') id: string,
    @Body() updateSongDto: UpdateSongDto,
  ): Promise<SongResponseDto> {
    return this.songsService.update(id, updateSongDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '곡 삭제', description: '특정 곡을 삭제합니다.' })
  @ApiParam({ name: 'id', description: '삭제할 곡의 ID' })
  @ApiResponse({ status: 200, description: '곡이 성공적으로 삭제되었습니다.' })
  @ApiResponse({ status: 404, description: '곡을 찾을 수 없습니다.' })
  remove(@Param('id') id: string): Promise<void> {
    return this.songsService.remove(id);
  }
}
