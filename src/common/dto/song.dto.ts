import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsDate,
  IsUUID,
  IsObject,
} from 'class-validator';

// 1. 하위 DTO들 먼저 선언
export class SongInfoResponseDto {
  @ApiProperty({
    description: '곡 정보 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  id: string;
  @ApiProperty({
    description: '곡 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  songId: string;
  @ApiPropertyOptional({ description: 'BPM', example: 140 })
  @IsOptional()
  @IsNumber()
  bpm?: number;
  @ApiPropertyOptional({ description: '박자', example: '4/4' })
  @IsOptional()
  @IsString()
  beat?: string;
  @ApiPropertyOptional({ description: '길이(초)', example: 180 })
  @IsOptional()
  @IsNumber()
  lengthSec?: number;
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

export class ComposerResponseDto {
  @ApiProperty({
    description: '작곡가 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  id: string;
  @ApiProperty({ description: '작곡가 이름', example: 'DJ TAKA' })
  @IsString()
  name: string;
  @ApiPropertyOptional({ description: '소속사', example: 'Konami' })
  @IsOptional()
  @IsString()
  companyName?: string;
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

export class GameResponseDto {
  @ApiProperty({
    description: '게임 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  id: string;
  @ApiProperty({
    description: '게임 이름',
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

export class DlcResponseDto {
  @ApiProperty({
    description: 'DLC ID',
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
  @ApiProperty({ description: 'DLC 이름', example: 'DDR 3rdMIX PLUS' })
  @IsString()
  dlcName: string;
  @ApiPropertyOptional({ description: '출시일' })
  @IsOptional()
  @IsDate()
  releaseDate?: Date;
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

export class TagResponseDto {
  @ApiProperty({
    description: '태그 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  id: string;
  @ApiProperty({ description: '태그 이름', example: 'J-POP' })
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

export class SongComposerResponseDto {
  @ApiProperty({
    description: '곡 작곡가 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  id: string;
  @ApiProperty({
    description: '곡 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  songId: string;
  @ApiProperty({
    description: '작곡가 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  composerId: string;
  @ApiPropertyOptional({
    type: ComposerResponseDto,
    description: '작곡가 정보',
  })
  @IsOptional()
  composer?: ComposerResponseDto;
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

export class SongGameVersionResponseDto {
  @ApiProperty({
    description: '곡 게임 버전 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  id: string;
  @ApiProperty({
    description: '곡 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  songId: string;
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
  @ApiPropertyOptional({
    description: '게임 내 제목',
    example: 'Butterfly (Upswing Mix)',
  })
  @IsOptional()
  @IsString()
  inGameTitle?: string;
  @ApiPropertyOptional({ description: 'BPM 오버라이드', example: 140 })
  @IsOptional()
  @IsNumber()
  bpmOverride?: number;
  @ApiPropertyOptional({ description: '길이(초)', example: 180 })
  @IsOptional()
  @IsNumber()
  lengthSec?: number;
  @ApiPropertyOptional({ description: '편곡', example: 'Upswing Mix' })
  @IsOptional()
  @IsString()
  arrangement?: string;
  @ApiPropertyOptional({ description: '첫 버전', example: 'DDR 3rdMIX' })
  @IsOptional()
  @IsString()
  firstVersion?: string;
  @ApiPropertyOptional({ description: '첫 출시일' })
  @IsOptional()
  @IsDate()
  firstDate?: Date;
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
  @ApiPropertyOptional({ type: GameResponseDto, description: '게임 정보' })
  @IsOptional()
  game?: GameResponseDto;
  @ApiPropertyOptional({ type: DlcResponseDto, description: 'DLC 정보' })
  @IsOptional()
  dlc?: DlcResponseDto;
}

export class SongTagResponseDto {
  @ApiProperty({
    description: '곡 태그 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  id: string;
  @ApiProperty({
    description: '곡 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  songId: string;
  @ApiProperty({
    description: '태그 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  tagId: string;
  @ApiPropertyOptional({ type: TagResponseDto, description: '태그 정보' })
  @IsOptional()
  tag?: TagResponseDto;
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

// 2. 상위 DTO들 선언
export class SongResponseDto {
  @ApiProperty({
    description: '곡 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  id: string;
  @ApiProperty({ description: '곡 제목', example: 'Butterfly' })
  @IsString()
  title: string;
  @ApiPropertyOptional({
    description: '원제목',
    example: 'Butterfly (Upswing Mix)',
  })
  @IsOptional()
  @IsString()
  originalTitle?: string;
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

export class SongWithRelationsDto extends SongResponseDto {
  @ApiPropertyOptional({
    type: [SongInfoResponseDto],
    description: '곡 정보 목록',
  })
  @IsOptional()
  songInfos?: SongInfoResponseDto[];
  @ApiPropertyOptional({
    type: [SongComposerResponseDto],
    description: '곡 작곡가 목록',
  })
  @IsOptional()
  songComposers?: SongComposerResponseDto[];
  @ApiPropertyOptional({
    type: [SongGameVersionResponseDto],
    description: '곡 게임 버전 목록',
  })
  @IsOptional()
  songGameVersions?: SongGameVersionResponseDto[];
  @ApiPropertyOptional({
    type: [SongTagResponseDto],
    description: '곡 태그 목록',
  })
  @IsOptional()
  songTags?: SongTagResponseDto[];
}

export class CreateSongDto {
  @ApiProperty({ description: '곡 제목', example: 'Butterfly' })
  @IsString()
  title: string;
  @ApiPropertyOptional({
    description: '원제목',
    example: 'Butterfly (Upswing Mix)',
  })
  @IsOptional()
  @IsString()
  originalTitle?: string;
}

export class UpdateSongDto {
  @ApiPropertyOptional({ description: '곡 제목', example: 'Butterfly' })
  @IsOptional()
  @IsString()
  title?: string;
  @ApiPropertyOptional({
    description: '원제목',
    example: 'Butterfly (Upswing Mix)',
  })
  @IsOptional()
  @IsString()
  originalTitle?: string;
}
