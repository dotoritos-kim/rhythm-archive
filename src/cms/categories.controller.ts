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
import { CategoriesService } from './categories.service';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryDto,
} from '../dto/cms.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface CategoryQuery {
  name?: string;
  parentId?: string;
}

/**
 * 카테고리 관리 API
 */
@ApiTags('CMS - 카테고리')
@Controller('cms/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  /**
   * 카테고리 전체 조회
   */
  @ApiOperation({
    summary: '카테고리 전체 조회',
    description: '모든 카테고리를 조회합니다.',
  })
  @ApiBearerAuth()
  @ApiQuery({
    name: 'isActive',
    description: '활성화 상태 필터',
    example: true,
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: '카테고리 목록 조회 성공',
    type: [CategoryDto],
  })
  @ApiResponse({
    status: 401,
    description: '인증되지 않은 요청',
  })
  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Query() query: CategoryQuery): Promise<CategoryDto[]> {
    return this.categoriesService.findAll(query);
  }

  /**
   * 카테고리 단건 조회
   */
  @ApiOperation({
    summary: '카테고리 단건 조회',
    description: '특정 카테고리의 상세 정보를 조회합니다.',
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: '카테고리 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: '카테고리 조회 성공',
    type: CategoryDto,
  })
  @ApiResponse({
    status: 401,
    description: '인증되지 않은 요청',
  })
  @ApiResponse({
    status: 404,
    description: '카테고리를 찾을 수 없음',
  })
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string): Promise<CategoryDto> {
    return this.categoriesService.findOne(id);
  }

  /**
   * 카테고리 생성
   */
  @ApiOperation({
    summary: '카테고리 생성',
    description: '새로운 카테고리를 생성합니다.',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: '카테고리 생성 성공',
    type: CategoryDto,
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
  async create(@Body() dto: CreateCategoryDto): Promise<CategoryDto> {
    return this.categoriesService.create(dto);
  }

  /**
   * 카테고리 수정
   */
  @ApiOperation({
    summary: '카테고리 수정',
    description: '기존 카테고리 정보를 수정합니다.',
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: '카테고리 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: '카테고리 수정 성공',
    type: CategoryDto,
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
    description: '카테고리를 찾을 수 없음',
  })
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ): Promise<CategoryDto> {
    return this.categoriesService.update(id, dto);
  }

  /**
   * 카테고리 삭제
   */
  @ApiOperation({
    summary: '카테고리 삭제',
    description: '카테고리를 삭제합니다.',
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: '카테고리 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: '카테고리 삭제 성공',
    type: CategoryDto,
  })
  @ApiResponse({
    status: 401,
    description: '인증되지 않은 요청',
  })
  @ApiResponse({
    status: 404,
    description: '카테고리를 찾을 수 없음',
  })
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string): Promise<CategoryDto> {
    return this.categoriesService.remove(id);
  }
}
