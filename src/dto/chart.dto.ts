import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsDate,
  IsUUID,
  IsObject,
} from 'class-validator';

export class CreateChartDto {
  @ApiProperty({
    description: '곡 게임 버전 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  sgvId: string;

  @ApiProperty({ description: '난이도명', example: 'BASIC' })
  @IsString()
  difficultyName: string;

  @ApiProperty({ description: '레벨', example: 5.5 })
  @IsNumber()
  level: number;

  @ApiPropertyOptional({ description: '노트 수', example: 150 })
  @IsOptional()
  @IsNumber()
  noteCount?: number;

  @ApiPropertyOptional({ description: '채보 타입', example: 'SINGLE' })
  @IsOptional()
  @IsString()
  chartType?: string;

  @ApiPropertyOptional({ description: '추가 정보' })
  @IsOptional()
  @IsObject()
  extra?: any;
}

export class UpdateChartDto {
  @ApiPropertyOptional({
    description: '곡 게임 버전 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  sgvId?: string;

  @ApiPropertyOptional({ description: '난이도명', example: 'BASIC' })
  @IsOptional()
  @IsString()
  difficultyName?: string;

  @ApiPropertyOptional({ description: '레벨', example: 5.5 })
  @IsOptional()
  @IsNumber()
  level?: number;

  @ApiPropertyOptional({ description: '노트 수', example: 150 })
  @IsOptional()
  @IsNumber()
  noteCount?: number;

  @ApiPropertyOptional({ description: '채보 타입', example: 'SINGLE' })
  @IsOptional()
  @IsString()
  chartType?: string;

  @ApiPropertyOptional({ description: '추가 정보' })
  @IsOptional()
  @IsObject()
  extra?: any;
}

export class ChartResponseDto {
  @ApiProperty({
    description: '채보 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: '곡 게임 버전 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  sgvId: string;

  @ApiProperty({ description: '난이도명', example: 'BASIC' })
  @IsString()
  difficultyName: string;

  @ApiProperty({ description: '레벨', example: 5.5 })
  @IsNumber()
  level: number;

  @ApiPropertyOptional({ description: '노트 수', example: 150 })
  @IsOptional()
  @IsNumber()
  noteCount?: number;

  @ApiPropertyOptional({ description: '채보 타입', example: 'SINGLE' })
  @IsOptional()
  @IsString()
  chartType?: string;

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
