import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AttachmentDto } from '../dto/cms.dto';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AttachmentsService {
  constructor(private prisma: PrismaService) {}

  async upload(
    file: Express.Multer.File,
    uploaderId: string,
  ): Promise<AttachmentDto> {
    if (!file) {
      throw new Error('파일이 업로드되지 않았습니다.');
    }

    // 파일 저장 디렉토리 생성
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // 파일명 생성
    const fileId = uuidv4().replace(/-/g, '');
    const fileExtension = path.extname(file.originalname);
    const filename = `${fileId}${fileExtension}`;
    const filePath = path.join(uploadDir, filename);

    // 파일 저장
    fs.writeFileSync(filePath, file.buffer);

    // 데이터베이스에 저장
    const attachment = await this.prisma.attachment.create({
      data: {
        id: fileId,
        filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: filePath,
        url: `/uploads/${filename}`,
        uploaderId,
      },
    });

    return {
      id: attachment.id,
      filename: attachment.filename,
      originalName: attachment.originalName,
      mimeType: attachment.mimeType,
      size: attachment.size,
      path: attachment.path,
      url: attachment.url,
      uploaderId: attachment.uploaderId,
      createdAt: attachment.createdAt.toISOString(),
      updatedAt: attachment.updatedAt.toISOString(),
    };
  }

  async get(id: string): Promise<AttachmentDto> {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id },
    });

    if (!attachment) {
      throw new NotFoundException('첨부파일을 찾을 수 없습니다.');
    }

    return {
      id: attachment.id,
      filename: attachment.filename,
      originalName: attachment.originalName,
      mimeType: attachment.mimeType,
      size: attachment.size,
      path: attachment.path,
      url: attachment.url,
      uploaderId: attachment.uploaderId,
      createdAt: attachment.createdAt.toISOString(),
      updatedAt: attachment.updatedAt.toISOString(),
    };
  }

  async remove(id: string): Promise<AttachmentDto> {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id },
    });

    if (!attachment) {
      throw new NotFoundException('첨부파일을 찾을 수 없습니다.');
    }

    // 파일 시스템에서 삭제
    try {
      if (fs.existsSync(attachment.path)) {
        fs.unlinkSync(attachment.path);
      }
    } catch (error) {
      console.error('파일 삭제 실패:', error);
    }

    // 데이터베이스에서 삭제
    const deletedAttachment = await this.prisma.attachment.delete({
      where: { id },
    });

    return {
      id: deletedAttachment.id,
      filename: deletedAttachment.filename,
      originalName: deletedAttachment.originalName,
      mimeType: deletedAttachment.mimeType,
      size: deletedAttachment.size,
      path: deletedAttachment.path,
      url: deletedAttachment.url,
      uploaderId: deletedAttachment.uploaderId,
      createdAt: deletedAttachment.createdAt.toISOString(),
      updatedAt: deletedAttachment.updatedAt.toISOString(),
    };
  }
}
