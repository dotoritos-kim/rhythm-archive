import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsDate,
  IsUUID,
  IsObject,
} from 'class-validator';

export class CreateCourseDto {
  @ApiProperty({
    description: '게임 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  gameId: string;

  @ApiPropertyOptional({
    description: 'DLC ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  dlcId?: string;

  @ApiProperty({ description: '코스명', example: 'BEGINNER COURSE' })
  @IsString()
  courseName: string;

  @ApiPropertyOptional({ description: '난이도', example: 'BEGINNER' })
  @IsOptional()
  @IsString()
  difficulty?: string;

  @ApiPropertyOptional({ description: '추가 정보' })
  @IsOptional()
  @IsObject()
  extra?: any;
}

export class UpdateCourseDto {
  @ApiPropertyOptional({
    description: '게임 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  gameId?: string;

  @ApiPropertyOptional({
    description: 'DLC ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  dlcId?: string;

  @ApiPropertyOptional({ description: '코스명', example: 'BEGINNER COURSE' })
  @IsOptional()
  @IsString()
  courseName?: string;

  @ApiPropertyOptional({ description: '난이도', example: 'BEGINNER' })
  @IsOptional()
  @IsString()
  difficulty?: string;

  @ApiPropertyOptional({ description: '추가 정보' })
  @IsOptional()
  @IsObject()
  extra?: any;
}

export class CourseResponseDto {
  @ApiProperty({
    description: '코스 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: '게임 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  gameId: string;

  @ApiPropertyOptional({
    description: 'DLC ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  dlcId?: string;

  @ApiProperty({ description: '코스명', example: 'BEGINNER COURSE' })
  @IsString()
  courseName: string;

  @ApiPropertyOptional({ description: '난이도', example: 'BEGINNER' })
  @IsOptional()
  @IsString()
  difficulty?: string;

  @ApiPropertyOptional({ description: '추가 정보' })
  @IsOptional()
  @IsObject()
  extra?: any;

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
