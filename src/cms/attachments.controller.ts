import {
  Controller,
  Post,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Get,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { AttachmentsService } from './attachments.service';
import { AttachmentDto } from '../dto/cms.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/**
 * 첨부파일 관리 API
 */
@ApiTags('CMS - 첨부파일')
@Controller('cms/attachments')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  /**
   * 파일 업로드
   */
  @ApiOperation({
    summary: '파일 업로드',
    description: '새로운 파일을 업로드합니다.',
  })
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: '업로드할 파일',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: '파일 업로드 성공',
    type: AttachmentDto,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 파일 형식',
  })
  @ApiResponse({
    status: 401,
    description: '인증되지 않은 요청',
  })
  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ): Promise<AttachmentDto> {
    return this.attachmentsService.upload(file, req.user.sub);
  }

  /**
   * 첨부파일 조회
   */
  @ApiOperation({
    summary: '첨부파일 조회',
    description: '특정 첨부파일의 정보를 조회합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '첨부파일 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: '첨부파일 조회 성공',
    type: AttachmentDto,
  })
  @ApiResponse({
    status: 404,
    description: '첨부파일을 찾을 수 없음',
  })
  @Get(':id')
  async get(@Param('id') id: string): Promise<AttachmentDto> {
    return this.attachmentsService.get(id);
  }

  /**
   * 첨부파일 삭제
   */
  @ApiOperation({
    summary: '첨부파일 삭제',
    description: '첨부파일을 삭제합니다.',
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: '첨부파일 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: '첨부파일 삭제 성공',
    type: AttachmentDto,
  })
  @ApiResponse({
    status: 401,
    description: '인증되지 않은 요청',
  })
  @ApiResponse({
    status: 404,
    description: '첨부파일을 찾을 수 없음',
  })
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string): Promise<AttachmentDto> {
    return this.attachmentsService.remove(id);
  }
}
