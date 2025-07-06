import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDate } from 'class-validator';

export class CreateSongDto {
  @ApiProperty({
    description: '곡 제목',
    example: '리듬게임 곡',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: '원제목',
    example: 'Rhythm Game Song',
    required: false,
  })
  @IsString()
  @IsOptional()
  originalTitle?: string;
}

export class UpdateSongDto {
  @ApiProperty({
    description: '곡 제목',
    example: '리듬게임 곡',
    required: false,
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: '원제목',
    example: 'Rhythm Game Song',
    required: false,
  })
  @IsString()
  @IsOptional()
  originalTitle?: string;

  @ApiProperty({
    description: '삭제 날짜',
    example: '2024-01-01T00:00:00.000Z',
    required: false,
  })
  @IsDate()
  @IsOptional()
  deletedAt?: Date;
}
