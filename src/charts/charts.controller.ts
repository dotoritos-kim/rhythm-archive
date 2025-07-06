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
import { ChartsService } from './charts.service';
import {
  CreateChartDto,
  UpdateChartDto,
  ChartResponseDto,
} from '../dto/chart.dto';

@ApiTags('charts')
@Controller('charts')
export class ChartsController {
  constructor(private readonly chartsService: ChartsService) {}

  @Post()
  @ApiOperation({
    summary: '새 채보 생성',
    description: '새로운 채보를 생성합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '채보가 성공적으로 생성되었습니다.',
    type: ChartResponseDto,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청입니다.' })
  create(@Body() createChartDto: CreateChartDto): Promise<ChartResponseDto> {
    return this.chartsService.create(createChartDto);
  }

  @Get()
  @ApiOperation({
    summary: '모든 채보 조회',
    description: '모든 채보 목록을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '채보 목록을 성공적으로 조회했습니다.',
    type: [ChartResponseDto],
  })
  findAll(): Promise<ChartResponseDto[]> {
    return this.chartsService.findAll();
  }

  @Get('search')
  @ApiOperation({
    summary: '채보 검색',
    description: '난이도명이나 채보 타입으로 채보를 검색합니다.',
  })
  @ApiQuery({ name: 'q', required: true, description: '검색할 키워드' })
  @ApiResponse({
    status: 200,
    description: '검색 결과를 성공적으로 조회했습니다.',
    type: [ChartResponseDto],
  })
  search(@Query('q') query: string): Promise<ChartResponseDto[]> {
    return this.chartsService.search(query);
  }

  @Get('sgv/:sgvId')
  @ApiOperation({
    summary: '곡 게임 버전별 채보 조회',
    description: '특정 곡 게임 버전의 채보들을 조회합니다.',
  })
  @ApiParam({ name: 'sgvId', description: '곡 게임 버전 ID' })
  @ApiResponse({
    status: 200,
    description: '채보 목록을 성공적으로 조회했습니다.',
    type: [ChartResponseDto],
  })
  findBySgvId(@Param('sgvId') sgvId: string): Promise<ChartResponseDto[]> {
    return this.chartsService.findBySgvId(sgvId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'ID로 채보 조회',
    description: 'ID로 특정 채보를 조회합니다.',
  })
  @ApiParam({ name: 'id', description: '조회할 채보의 ID' })
  @ApiResponse({
    status: 200,
    description: '채보를 성공적으로 조회했습니다.',
    type: ChartResponseDto,
  })
  @ApiResponse({ status: 404, description: '채보를 찾을 수 없습니다.' })
  findOne(@Param('id') id: string): Promise<ChartResponseDto> {
    return this.chartsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: '채보 수정',
    description: '특정 채보의 정보를 수정합니다.',
  })
  @ApiParam({ name: 'id', description: '수정할 채보의 ID' })
  @ApiResponse({
    status: 200,
    description: '채보가 성공적으로 수정되었습니다.',
    type: ChartResponseDto,
  })
  @ApiResponse({ status: 404, description: '채보를 찾을 수 없습니다.' })
  update(
    @Param('id') id: string,
    @Body() updateChartDto: UpdateChartDto,
  ): Promise<ChartResponseDto> {
    return this.chartsService.update(id, updateChartDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: '채보 삭제',
    description: '특정 채보를 삭제합니다.',
  })
  @ApiParam({ name: 'id', description: '삭제할 채보의 ID' })
  @ApiResponse({
    status: 200,
    description: '채보가 성공적으로 삭제되었습니다.',
  })
  @ApiResponse({ status: 404, description: '채보를 찾을 수 없습니다.' })
  remove(@Param('id') id: string): Promise<void> {
    return this.chartsService.remove(id);
  }
}
