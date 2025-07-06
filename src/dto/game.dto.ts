import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsDate,
  IsUUID,
  IsObject,
} from 'class-validator';

export class CreateGameDto {
  @ApiProperty({
    description: '게임명',
    example: 'Dance Dance Revolution 3rdMIX',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: '출시일' })
  @IsOptional()
  @IsDate()
  releaseDate?: Date;

  @ApiPropertyOptional({ description: '퍼블리셔', example: 'Konami' })
  @IsOptional()
  @IsString()
  publisher?: string;

  @ApiPropertyOptional({ description: '추가 정보' })
  @IsOptional()
  @IsObject()
  extra?: any;
}

export class UpdateGameDto {
  @ApiPropertyOptional({
    description: '게임명',
    example: 'Dance Dance Revolution 3rdMIX',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '출시일' })
  @IsOptional()
  @IsDate()
  releaseDate?: Date;

  @ApiPropertyOptional({ description: '퍼블리셔', example: 'Konami' })
  @IsOptional()
  @IsString()
  publisher?: string;

  @ApiPropertyOptional({ description: '추가 정보' })
  @IsOptional()
  @IsObject()
  extra?: any;
}

export class GameResponseDto {
  @ApiProperty({
    description: '게임 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: '게임명',
    example: 'Dance Dance Revolution 3rdMIX',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: '출시일' })
  @IsOptional()
  @IsDate()
  releaseDate?: Date;

  @ApiPropertyOptional({ description: '퍼블리셔', example: 'Konami' })
  @IsOptional()
  @IsString()
  publisher?: string;

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
