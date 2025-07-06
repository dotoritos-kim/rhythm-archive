import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsDate,
  IsUUID,
  IsObject,
} from 'class-validator';

export class CreateTagDto {
  @ApiProperty({ description: '태그명', example: 'J-POP' })
  @IsString()
  name: string;
}

export class UpdateTagDto {
  @ApiPropertyOptional({ description: '태그명', example: 'J-POP' })
  @IsOptional()
  @IsString()
  name?: string;
}

export class TagResponseDto {
  @ApiProperty({
    description: '태그 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  id: string;

  @ApiProperty({ description: '태그명', example: 'J-POP' })
  @IsString()
  name: string;

  @ApiProperty({ description: '생성일' })
  @IsDate()
  createdAt: Date;

  @ApiProperty({ description: '수정일' })
  @IsDate()
  updatedAt: Date;

  @ApiPropertyOptional({ description: '삭제일' })
  @IsOptional()
  @IsDate()
  deletedAt?: Date;
}
