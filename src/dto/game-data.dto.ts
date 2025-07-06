import { TypedBody, TypedRoute } from '@nestia/core';
import typia from 'typia';

/**
 * @typia.json
 */
export interface GameDataDto {
  game: {
    name: string;
    releaseDate?: string;
    publisher?: string;
    extra?: any;
  };
  songs: SongDataDto[];
  courses?: CourseDataDto[];
}

/**
 * @typia.json
 */
export interface SongDataDto {
  title: string;
  originalTitle?: string;
  songInfo?: {
    bpm?: number;
    beat?: string;
    lengthSec?: number;
    extra?: any;
  };
  composers?: ComposerDataDto[];
  gameVersions: GameVersionDataDto[];
  tags?: string[];
}

/**
 * @typia.json
 */
export interface ComposerDataDto {
  name: string;
  companyName?: string;
  extra?: any;
}

/**
 * @typia.json
 */
export interface GameVersionDataDto {
  inGameTitle?: string;
  bpmOverride?: number;
  lengthSec?: number;
  arrangement?: string;
  firstVersion?: string;
  firstDate?: string;
  extra?: any;
  charts: ChartDataDto[];
  dlcName?: string;
  dlcReleaseDate?: string;
}

/**
 * @typia.json
 */
export interface ChartDataDto {
  difficultyName: string;
  level: number;
  noteCount?: number;
  chartType?: string;
  extra?: any;
}

/**
 * @typia.json
 */
export interface CourseDataDto {
  courseName: string;
  difficulty?: string;
  dlcName?: string;
  courseEntries: CourseEntryDataDto[];
  extra?: any;
}

/**
 * @typia.json
 */
export interface CourseEntryDataDto {
  songTitle: string;
  difficultyName: string;
  chartType?: string;
  position: number;
  extra?: any;
}
