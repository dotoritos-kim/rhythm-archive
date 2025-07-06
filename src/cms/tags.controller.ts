import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { TagsService } from './tags.service';
import { CreateCmsTagDto, UpdateCmsTagDto, TagDto } from '../dto/cms.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface TagQuery {
  name?: string;
}

/**
 * 태그 관리 API
 */
@ApiTags('CMS - 태그')
@Controller('cms/tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  /**
   * 태그 전체 조회
   */
  @ApiOperation({
    summary: '태그 전체 조회',
    description: '모든 태그를 조회합니다.',
  })
  @ApiBearerAuth()
  @ApiQuery({
    name: 'name',
    description: '태그 이름 검색',
    example: '리듬게임',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: '태그 목록 조회 성공',
    type: [TagDto],
  })
  @ApiResponse({
    status: 401,
    description: '인증되지 않은 요청',
  })
  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Query() query: TagQuery): Promise<TagDto[]> {
    return this.tagsService.findAll(query);
  }

  /**
   * 태그 단건 조회
   */
  @ApiOperation({
    summary: '태그 단건 조회',
    description: '특정 태그의 상세 정보를 조회합니다.',
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: '태그 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: '태그 조회 성공',
    type: TagDto,
  })
  @ApiResponse({
    status: 401,
    description: '인증되지 않은 요청',
  })
  @ApiResponse({
    status: 404,
    description: '태그를 찾을 수 없음',
  })
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string): Promise<TagDto> {
    return this.tagsService.findOne(id);
  }

  /**
   * 태그 생성
   */
  @ApiOperation({
    summary: '태그 생성',
    description: '새로운 태그를 생성합니다.',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: '태그 생성 성공',
    type: TagDto,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 데이터',
  })
  @ApiResponse({
    status: 401,
    description: '인증되지 않은 요청',
  })
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: CreateCmsTagDto): Promise<TagDto> {
    return this.tagsService.create(dto);
  }

  /**
   * 태그 수정
   */
  @ApiOperation({
    summary: '태그 수정',
    description: '기존 태그 정보를 수정합니다.',
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: '태그 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: '태그 수정 성공',
    type: TagDto,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 데이터',
  })
  @ApiResponse({
    status: 401,
    description: '인증되지 않은 요청',
  })
  @ApiResponse({
    status: 404,
    description: '태그를 찾을 수 없음',
  })
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCmsTagDto,
  ): Promise<TagDto> {
    return this.tagsService.update(id, dto);
  }

  /**
   * 태그 삭제
   */
  @ApiOperation({
    summary: '태그 삭제',
    description: '태그를 삭제합니다.',
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: '태그 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: '태그 삭제 성공',
    type: TagDto,
  })
  @ApiResponse({
    status: 401,
    description: '인증되지 않은 요청',
  })
  @ApiResponse({
    status: 404,
    description: '태그를 찾을 수 없음',
  })
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string): Promise<TagDto> {
    return this.tagsService.remove(id);
  }
}
