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
import { CoursesService } from './courses.service';
import {
  CreateCourseDto,
  UpdateCourseDto,
  CourseResponseDto,
} from '../dto/course.dto';

@ApiTags('courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @ApiOperation({
    summary: '새 코스 생성',
    description: '새로운 코스를 생성합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '코스가 성공적으로 생성되었습니다.',
    type: CourseResponseDto,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청입니다.' })
  create(@Body() createCourseDto: CreateCourseDto): Promise<CourseResponseDto> {
    return this.coursesService.create(createCourseDto);
  }

  @Get()
  @ApiOperation({
    summary: '모든 코스 조회',
    description: '모든 코스 목록을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '코스 목록을 성공적으로 조회했습니다.',
    type: [CourseResponseDto],
  })
  findAll(): Promise<CourseResponseDto[]> {
    return this.coursesService.findAll();
  }

  @Get('search')
  @ApiOperation({
    summary: '코스 검색',
    description: '코스명이나 난이도로 코스를 검색합니다.',
  })
  @ApiQuery({ name: 'q', required: true, description: '검색할 키워드' })
  @ApiResponse({
    status: 200,
    description: '검색 결과를 성공적으로 조회했습니다.',
    type: [CourseResponseDto],
  })
  search(@Query('q') query: string): Promise<CourseResponseDto[]> {
    return this.coursesService.search(query);
  }

  @Get('game/:gameId')
  @ApiOperation({
    summary: '게임별 코스 조회',
    description: '특정 게임의 코스들을 조회합니다.',
  })
  @ApiParam({ name: 'gameId', description: '게임 ID' })
  @ApiResponse({
    status: 200,
    description: '코스 목록을 성공적으로 조회했습니다.',
    type: [CourseResponseDto],
  })
  findByGameId(@Param('gameId') gameId: string): Promise<CourseResponseDto[]> {
    return this.coursesService.findByGameId(gameId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'ID로 코스 조회',
    description: 'ID로 특정 코스를 조회합니다.',
  })
  @ApiParam({ name: 'id', description: '조회할 코스의 ID' })
  @ApiResponse({
    status: 200,
    description: '코스를 성공적으로 조회했습니다.',
    type: CourseResponseDto,
  })
  @ApiResponse({ status: 404, description: '코스를 찾을 수 없습니다.' })
  findOne(@Param('id') id: string): Promise<CourseResponseDto> {
    return this.coursesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: '코스 수정',
    description: '특정 코스의 정보를 수정합니다.',
  })
  @ApiParam({ name: 'id', description: '수정할 코스의 ID' })
  @ApiResponse({
    status: 200,
    description: '코스가 성공적으로 수정되었습니다.',
    type: CourseResponseDto,
  })
  @ApiResponse({ status: 404, description: '코스를 찾을 수 없습니다.' })
  update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ): Promise<CourseResponseDto> {
    return this.coursesService.update(id, updateCourseDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: '코스 삭제',
    description: '특정 코스를 삭제합니다.',
  })
  @ApiParam({ name: 'id', description: '삭제할 코스의 ID' })
  @ApiResponse({
    status: 200,
    description: '코스가 성공적으로 삭제되었습니다.',
  })
  @ApiResponse({ status: 404, description: '코스를 찾을 수 없습니다.' })
  remove(@Param('id') id: string): Promise<void> {
    return this.coursesService.remove(id);
  }
}
