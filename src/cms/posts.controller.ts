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
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { PostsService } from './posts.service';
import {
  CreatePostDto,
  UpdatePostDto,
  PostDto,
  PostStatus,
} from '../dto/cms.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface PostQuery {
  title?: string;
  status?: PostStatus;
  categoryId?: string;
  authorId?: string;
  isSticky?: string;
}

/**
 * 게시글 관리 API
 */
@ApiTags('CMS - 게시글')
@Controller('cms/posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  /**
   * 게시글 전체 조회
   */
  @ApiOperation({
    summary: '게시글 전체 조회',
    description: '모든 게시글을 조회합니다.',
  })
  @ApiBearerAuth()
  @ApiQuery({
    name: 'status',
    description: '게시글 상태 필터',
    example: 'PUBLISHED',
    required: false,
  })
  @ApiQuery({
    name: 'categoryId',
    description: '카테고리 ID 필터',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: '게시글 목록 조회 성공',
    type: [PostDto],
  })
  @ApiResponse({
    status: 401,
    description: '인증되지 않은 요청',
  })
  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Query() query: PostQuery): Promise<PostDto[]> {
    return this.postsService.findAll(query);
  }

  /**
   * 게시글 단건 조회
   */
  @ApiOperation({
    summary: '게시글 단건 조회',
    description: '특정 게시글의 상세 정보를 조회합니다.',
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: '게시글 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: '게시글 조회 성공',
    type: PostDto,
  })
  @ApiResponse({
    status: 401,
    description: '인증되지 않은 요청',
  })
  @ApiResponse({
    status: 404,
    description: '게시글을 찾을 수 없음',
  })
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string): Promise<PostDto> {
    return this.postsService.findOne(id);
  }

  /**
   * 게시글 생성
   */
  @ApiOperation({
    summary: '게시글 생성',
    description: '새로운 게시글을 생성합니다.',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: '게시글 생성 성공',
    type: PostDto,
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
  async create(@Body() dto: CreatePostDto, @Req() req): Promise<PostDto> {
    return this.postsService.create(dto, req.user.sub);
  }

  /**
   * 게시글 수정
   */
  @ApiOperation({
    summary: '게시글 수정',
    description: '기존 게시글 정보를 수정합니다.',
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: '게시글 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: '게시글 수정 성공',
    type: PostDto,
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
    description: '게시글을 찾을 수 없음',
  })
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePostDto,
  ): Promise<PostDto> {
    return this.postsService.update(id, dto);
  }

  /**
   * 게시글 삭제
   */
  @ApiOperation({
    summary: '게시글 삭제',
    description: '게시글을 삭제합니다.',
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: '게시글 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: '게시글 삭제 성공',
    type: PostDto,
  })
  @ApiResponse({
    status: 401,
    description: '인증되지 않은 요청',
  })
  @ApiResponse({
    status: 404,
    description: '게시글을 찾을 수 없음',
  })
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string): Promise<PostDto> {
    return this.postsService.remove(id);
  }
}
