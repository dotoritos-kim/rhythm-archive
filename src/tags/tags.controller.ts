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
import { TagsService } from './tags.service';
import { CreateTagDto, UpdateTagDto, TagResponseDto } from '../dto/tag.dto';

@ApiTags('tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  @ApiOperation({
    summary: '새 태그 생성',
    description: '새로운 태그를 생성합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '태그가 성공적으로 생성되었습니다.',
    type: TagResponseDto,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청입니다.' })
  create(@Body() createTagDto: CreateTagDto): Promise<TagResponseDto> {
    return this.tagsService.create(createTagDto);
  }

  @Get()
  @ApiOperation({
    summary: '모든 태그 조회',
    description: '모든 태그 목록을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '태그 목록을 성공적으로 조회했습니다.',
    type: [TagResponseDto],
  })
  findAll(): Promise<TagResponseDto[]> {
    return this.tagsService.findAll();
  }

  @Get('search')
  @ApiOperation({
    summary: '태그 검색',
    description: '태그명으로 태그를 검색합니다.',
  })
  @ApiQuery({ name: 'q', required: true, description: '검색할 태그명' })
  @ApiResponse({
    status: 200,
    description: '검색 결과를 성공적으로 조회했습니다.',
    type: [TagResponseDto],
  })
  search(@Query('q') query: string): Promise<TagResponseDto[]> {
    return this.tagsService.search(query);
  }

  @Get('name/:name')
  @ApiOperation({
    summary: '이름으로 태그 조회',
    description: '이름으로 특정 태그를 조회합니다.',
  })
  @ApiParam({ name: 'name', description: '조회할 태그의 이름' })
  @ApiResponse({
    status: 200,
    description: '태그를 성공적으로 조회했습니다.',
    type: TagResponseDto,
  })
  @ApiResponse({ status: 404, description: '태그를 찾을 수 없습니다.' })
  findByName(@Param('name') name: string): Promise<TagResponseDto> {
    return this.tagsService.findByName(name);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'ID로 태그 조회',
    description: 'ID로 특정 태그를 조회합니다.',
  })
  @ApiParam({ name: 'id', description: '조회할 태그의 ID' })
  @ApiResponse({
    status: 200,
    description: '태그를 성공적으로 조회했습니다.',
    type: TagResponseDto,
  })
  @ApiResponse({ status: 404, description: '태그를 찾을 수 없습니다.' })
  findOne(@Param('id') id: string): Promise<TagResponseDto> {
    return this.tagsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: '태그 수정',
    description: '특정 태그의 정보를 수정합니다.',
  })
  @ApiParam({ name: 'id', description: '수정할 태그의 ID' })
  @ApiResponse({
    status: 200,
    description: '태그가 성공적으로 수정되었습니다.',
    type: TagResponseDto,
  })
  @ApiResponse({ status: 404, description: '태그를 찾을 수 없습니다.' })
  update(
    @Param('id') id: string,
    @Body() updateTagDto: UpdateTagDto,
  ): Promise<TagResponseDto> {
    return this.tagsService.update(id, updateTagDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: '태그 삭제',
    description: '특정 태그를 삭제합니다.',
  })
  @ApiParam({ name: 'id', description: '삭제할 태그의 ID' })
  @ApiResponse({
    status: 200,
    description: '태그가 성공적으로 삭제되었습니다.',
  })
  @ApiResponse({ status: 404, description: '태그를 찾을 수 없습니다.' })
  remove(@Param('id') id: string): Promise<void> {
    return this.tagsService.remove(id);
  }
}
