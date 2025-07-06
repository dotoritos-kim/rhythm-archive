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
import { GamesService } from './games.service';
import { CreateGameDto, UpdateGameDto, GameResponseDto } from '../dto/game.dto';

@ApiTags('games')
@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Post()
  @ApiOperation({
    summary: '새 게임 생성',
    description: '새로운 게임을 생성합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '게임이 성공적으로 생성되었습니다.',
    type: GameResponseDto,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청입니다.' })
  create(@Body() createGameDto: CreateGameDto): Promise<GameResponseDto> {
    return this.gamesService.create(createGameDto);
  }

  @Get()
  @ApiOperation({
    summary: '모든 게임 조회',
    description: '모든 게임 목록을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '게임 목록을 성공적으로 조회했습니다.',
    type: [GameResponseDto],
  })
  findAll(): Promise<GameResponseDto[]> {
    return this.gamesService.findAll();
  }

  @Get('search')
  @ApiOperation({
    summary: '게임 검색',
    description: '게임명이나 퍼블리셔로 게임을 검색합니다.',
  })
  @ApiQuery({ name: 'q', required: true, description: '검색할 키워드' })
  @ApiResponse({
    status: 200,
    description: '검색 결과를 성공적으로 조회했습니다.',
    type: [GameResponseDto],
  })
  search(@Query('q') query: string): Promise<GameResponseDto[]> {
    return this.gamesService.search(query);
  }

  @Get('name/:name')
  @ApiOperation({
    summary: '이름으로 게임 조회',
    description: '이름으로 특정 게임을 조회합니다.',
  })
  @ApiParam({ name: 'name', description: '조회할 게임의 이름' })
  @ApiResponse({
    status: 200,
    description: '게임을 성공적으로 조회했습니다.',
    type: GameResponseDto,
  })
  @ApiResponse({ status: 404, description: '게임을 찾을 수 없습니다.' })
  findByName(@Param('name') name: string): Promise<GameResponseDto> {
    return this.gamesService.findByName(name);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'ID로 게임 조회',
    description: 'ID로 특정 게임을 조회합니다.',
  })
  @ApiParam({ name: 'id', description: '조회할 게임의 ID' })
  @ApiResponse({
    status: 200,
    description: '게임을 성공적으로 조회했습니다.',
    type: GameResponseDto,
  })
  @ApiResponse({ status: 404, description: '게임을 찾을 수 없습니다.' })
  findOne(@Param('id') id: string): Promise<GameResponseDto> {
    return this.gamesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: '게임 수정',
    description: '특정 게임의 정보를 수정합니다.',
  })
  @ApiParam({ name: 'id', description: '수정할 게임의 ID' })
  @ApiResponse({
    status: 200,
    description: '게임이 성공적으로 수정되었습니다.',
    type: GameResponseDto,
  })
  @ApiResponse({ status: 404, description: '게임을 찾을 수 없습니다.' })
  update(
    @Param('id') id: string,
    @Body() updateGameDto: UpdateGameDto,
  ): Promise<GameResponseDto> {
    return this.gamesService.update(id, updateGameDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: '게임 삭제',
    description: '특정 게임을 삭제합니다.',
  })
  @ApiParam({ name: 'id', description: '삭제할 게임의 ID' })
  @ApiResponse({
    status: 200,
    description: '게임이 성공적으로 삭제되었습니다.',
  })
  @ApiResponse({ status: 404, description: '게임을 찾을 수 없습니다.' })
  remove(@Param('id') id: string): Promise<void> {
    return this.gamesService.remove(id);
  }
}
