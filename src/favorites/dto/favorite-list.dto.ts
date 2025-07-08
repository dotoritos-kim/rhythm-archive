import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateFavoriteListDto {
  @ApiProperty({
    description: '즐겨찾기 리스트 이름',
    example: '내가 좋아하는 곡들',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: '즐겨찾기 리스트 설명',
    example: '개인적으로 좋아하는 곡들의 모음',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateFavoriteListDto {
  @ApiProperty({
    description: '즐겨찾기 리스트 이름',
    example: '수정된 리스트 이름',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: '즐겨찾기 리스트 설명',
    example: '수정된 설명',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}

export class AddFavoriteItemDto {
  @ApiProperty({
    description: '아이템 타입',
    example: 'song',
  })
  @IsString()
  itemType: string;

  @ApiProperty({
    description: '아이템 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  itemId: string;

  @ApiProperty({
    description: '정렬 순서',
    example: 1,
    required: false,
  })
  @IsOptional()
  order?: number;

  @ApiProperty({
    description: '추가 메타데이터',
    required: false,
  })
  @IsOptional()
  metadata?: any;
}
