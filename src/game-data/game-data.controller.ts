import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpStatus,
  HttpCode,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { GameDataService } from './game-data.service';
import { GameDataDto } from '../dto/game-data.dto';
import typia from 'typia';

@ApiTags('게임 데이터')
@Controller('game-data')
export class GameDataController {
  constructor(private readonly gameDataService: GameDataService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '게임 데이터 추가',
    description: '새로운 게임 데이터를 추가합니다.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        gameName: { type: 'string', example: '리듬게임' },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: '게임 데이터가 성공적으로 추가되었습니다.',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
        gameName: { type: 'string', example: '리듬게임' },
        data: { type: 'object' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 데이터 형식입니다.',
  })
  async addGameData(@Body() gameData: GameDataDto) {
    if (!typia.is<GameDataDto>(gameData)) {
      throw new BadRequestException('잘못된 데이터 형식입니다.');
    }
    return await this.gameDataService.addGameData(gameData);
  }

  @Get(':gameName')
  @ApiOperation({
    summary: '게임 데이터 조회',
    description: '특정 게임의 데이터를 조회합니다.',
  })
  @ApiParam({
    name: 'gameName',
    description: '조회할 게임의 이름',
    example: '리듬게임',
  })
  @ApiResponse({
    status: 200,
    description: '게임 데이터를 성공적으로 조회했습니다.',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
        gameName: { type: 'string', example: '리듬게임' },
        data: { type: 'object' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '게임 이름이 올바르지 않습니다.',
  })
  @ApiResponse({
    status: 404,
    description: '게임 데이터를 찾을 수 없습니다.',
  })
  async getGameData(@Param('gameName') gameName: string) {
    if (typeof gameName !== 'string' || !gameName.trim()) {
      throw new BadRequestException('게임 이름이 올바르지 않습니다.');
    }
    return await this.gameDataService.getGameData(gameName);
  }
}
