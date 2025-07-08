import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FavoriteItemDto } from './dto/favorite-item.dto';
import {
  CreateFavoriteListDto,
  UpdateFavoriteListDto,
  AddFavoriteItemDto,
} from './dto/favorite-list.dto';

@ApiTags('즐겨찾기')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  /**
   * 내 즐겨찾기 리스트 목록 조회
   */
  @Get()
  @ApiOperation({
    summary: '즐겨찾기 리스트 목록 조회',
    description: '현재 사용자의 모든 즐겨찾기 리스트를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '즐겨찾기 리스트 목록 조회 성공',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          name: { type: 'string', example: '내가 좋아하는 곡들' },
          description: {
            type: 'string',
            example: '개인적으로 좋아하는 곡들의 모음',
          },
          userId: {
            type: 'string',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '인증되지 않은 요청',
  })
  async getMyFavoriteLists(@Req() req) {
    const userId = req.user.sub;
    return await this.favoritesService.getUserFavoriteLists(userId);
  }

  /**
   * 즐겨찾기 리스트 생성
   */
  @Post()
  @ApiOperation({
    summary: '즐겨찾기 리스트 생성',
    description: '새로운 즐겨찾기 리스트를 생성합니다.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: '내가 좋아하는 곡들' },
        description: {
          type: 'string',
          example: '개인적으로 좋아하는 곡들의 모음',
        },
      },
      required: ['name'],
    },
  })
  @ApiResponse({
    status: 201,
    description: '즐겨찾기 리스트 생성 성공',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
        name: { type: 'string', example: '내가 좋아하는 곡들' },
        description: {
          type: 'string',
          example: '개인적으로 좋아하는 곡들의 모음',
        },
        userId: {
          type: 'string',
          example: '123e4567-e89b-12d3-a456-426614174000',
        },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 데이터',
  })
  @ApiResponse({
    status: 401,
    description: '인증되지 않은 요청',
  })
  async createFavoriteList(@Body() body: CreateFavoriteListDto, @Req() req) {
    const userId = req.user.sub;
    return await this.favoritesService.createFavoriteList(
      userId,
      body.name,
      body.description,
    );
  }

  /**
   * 즐겨찾기 리스트 상세 조회 (아이템 상세 정보 포함)
   */
  @Get(':listId')
  @ApiOperation({
    summary: '즐겨찾기 리스트 조회',
    description:
      '특정 즐겨찾기 리스트의 상세 정보와 포함된 아이템들을 조회합니다.',
  })
  @ApiParam({
    name: 'listId',
    description: '즐겨찾기 리스트 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: '즐겨찾기 리스트 조회 성공',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
        name: { type: 'string', example: '내가 좋아하는 곡들' },
        description: {
          type: 'string',
          example: '개인적으로 좋아하는 곡들의 모음',
        },
        userId: {
          type: 'string',
          example: '123e4567-e89b-12d3-a456-426614174000',
        },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              type: { type: 'string', example: 'song' },
              itemId: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              item: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                  // 기타 아이템 속성들
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '인증되지 않은 요청',
  })
  @ApiResponse({
    status: 404,
    description: '즐겨찾기 리스트를 찾을 수 없습니다',
  })
  async getFavoriteList(@Param('listId') listId: string, @Req() req) {
    const userId = req.user.sub;
    const list = await this.favoritesService.getFavoriteListWithItems(
      userId,
      listId,
    );
    if (!list)
      throw new NotFoundException('즐겨찾기 리스트를 찾을 수 없습니다');
    return list;
  }

  /**
   * 즐겨찾기 리스트 수정
   */
  @Put(':listId')
  @ApiOperation({
    summary: '즐겨찾기 리스트 수정',
    description: '즐겨찾기 리스트의 이름과 설명을 수정합니다.',
  })
  @ApiParam({
    name: 'listId',
    description: '즐겨찾기 리스트 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: '수정된 리스트 이름' },
        description: { type: 'string', example: '수정된 설명' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '즐겨찾기 리스트 수정 성공',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
        name: { type: 'string', example: '수정된 리스트 이름' },
        description: { type: 'string', example: '수정된 설명' },
        userId: {
          type: 'string',
          example: '123e4567-e89b-12d3-a456-426614174000',
        },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '인증되지 않은 요청',
  })
  @ApiResponse({
    status: 404,
    description: '즐겨찾기 리스트를 찾을 수 없습니다',
  })
  async updateFavoriteList(
    @Param('listId') listId: string,
    @Body() body: UpdateFavoriteListDto,
    @Req() req,
  ) {
    const userId = req.user.sub;
    return await this.favoritesService.updateFavoriteList(userId, listId, body);
  }

  /**
   * 즐겨찾기 리스트 삭제
   */
  @Delete(':listId')
  @ApiOperation({
    summary: '즐겨찾기 리스트 삭제',
    description: '즐겨찾기 리스트와 포함된 모든 아이템을 삭제합니다.',
  })
  @ApiParam({
    name: 'listId',
    description: '즐겨찾기 리스트 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: '즐겨찾기 리스트 삭제 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: '즐겨찾기 리스트가 삭제되었습니다.',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '인증되지 않은 요청',
  })
  @ApiResponse({
    status: 404,
    description: '즐겨찾기 리스트를 찾을 수 없습니다',
  })
  async deleteFavoriteList(@Param('listId') listId: string, @Req() req) {
    const userId = req.user.sub;
    await this.favoritesService.deleteFavoriteList(userId, listId);
    return { success: true, message: '즐겨찾기 리스트가 삭제되었습니다.' };
  }

  /**
   * 즐겨찾기 아이템 추가
   */
  @Post(':listId/items')
  @ApiOperation({
    summary: '즐겨찾기 아이템 추가',
    description: '즐겨찾기 리스트에 새로운 아이템을 추가합니다.',
  })
  @ApiParam({
    name: 'listId',
    description: '즐겨찾기 리스트 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        itemType: {
          type: 'string',
          example: 'song',
          enum: ['song', 'chart', 'game', 'course'],
        },
        itemId: {
          type: 'string',
          example: '123e4567-e89b-12d3-a456-426614174000',
        },
        order: { type: 'number', example: 1 },
        metadata: {
          type: 'object',
          example: { note: '좋아하는 곡' },
        },
      },
      required: ['itemType', 'itemId'],
    },
  })
  @ApiResponse({
    status: 201,
    description: '즐겨찾기 아이템 추가 성공',
    type: FavoriteItemDto,
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
    description: '즐겨찾기 리스트를 찾을 수 없습니다',
  })
  async addFavoriteItem(
    @Param('listId') listId: string,
    @Body() body: AddFavoriteItemDto,
    @Req() req,
  ) {
    const userId = req.user.sub;
    return await this.favoritesService.addFavoriteItem(
      userId,
      listId,
      body.itemType,
      body.itemId,
      body.order,
      body.metadata,
    );
  }

  /**
   * 즐겨찾기 아이템 제거
   */
  @Delete(':listId/items/:itemId')
  @ApiOperation({
    summary: '즐겨찾기 아이템 제거',
    description: '즐겨찾기 리스트에서 특정 아이템을 제거합니다.',
  })
  @ApiParam({
    name: 'listId',
    description: '즐겨찾기 리스트 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'itemId',
    description: '즐겨찾기 아이템 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: '즐겨찾기 아이템 제거 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: '즐겨찾기 아이템이 제거되었습니다.',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '인증되지 않은 요청',
  })
  @ApiResponse({
    status: 404,
    description: '즐겨찾기 리스트 또는 아이템을 찾을 수 없습니다',
  })
  async removeFavoriteItem(
    @Param('listId') listId: string,
    @Param('itemId') itemId: string,
    @Req() req,
  ) {
    const userId = req.user.sub;
    await this.favoritesService.removeFavoriteItem(userId, listId, itemId);
    return { success: true, message: '즐겨찾기 아이템이 제거되었습니다.' };
  }
}
