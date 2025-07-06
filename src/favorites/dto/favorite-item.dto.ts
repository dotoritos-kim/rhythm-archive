import { ApiProperty } from '@nestjs/swagger';

export class FavoriteItemDto {
  @ApiProperty({
    description: '즐겨찾기 아이템 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: '아이템 타입',
    example: 'song',
    enum: ['song', 'chart', 'game', 'course'],
  })
  itemType: 'song' | 'chart' | 'game' | 'course';

  @ApiProperty({
    description: '아이템 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  itemId: string;

  @ApiProperty({
    description: '아이템 제목',
    example: 'Butterfly',
  })
  title: string;

  @ApiProperty({
    description: '아이템 설명',
    example: 'DJ TAKA의 대표곡',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: '정렬 순서',
    example: 1,
    required: false,
  })
  order?: number;

  @ApiProperty({
    description: '추가 메타데이터',
    example: { bpm: 140, genre: 'J-POP' },
    required: false,
  })
  metadata?: any;

  // 상세 정보
  @ApiProperty({
    description: '곡 정보',
    required: false,
    type: Object,
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Butterfly',
      artist: 'DJ TAKA',
      bpm: 140,
      lengthSec: 180,
    },
  })
  songInfo?: {
    id: string;
    title: string;
    artist?: string;
    bpm?: number;
    lengthSec?: number;
  } | null;

  @ApiProperty({
    description: '채보 정보',
    required: false,
    type: Object,
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      songId: '123e4567-e89b-12d3-a456-426614174000',
      difficultyName: 'BASIC',
      level: 5.5,
      noteCount: 150,
      songTitle: 'Butterfly',
    },
  })
  chartInfo?: {
    id: string;
    songId: string;
    difficultyName: string;
    level: number;
    noteCount?: number | null;
    songTitle?: string;
  } | null;

  @ApiProperty({
    description: '게임 정보',
    required: false,
    type: Object,
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Dance Dance Revolution 3rdMIX',
    },
  })
  gameInfo?: {
    id: string;
    name: string;
  } | null;

  @ApiProperty({
    description: '코스 정보',
    required: false,
    type: Object,
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      courseName: '초급자 코스',
    },
  })
  courseInfo?: {
    id: string;
    courseName: string;
  } | null;
}
