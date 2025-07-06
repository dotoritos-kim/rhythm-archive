export class CreateSongInfoDto {
  songId: string;
  bpm?: number;
  beat?: string;
  lengthSec?: number;
  extra?: any;
}

export class UpdateSongInfoDto {
  bpm?: number;
  beat?: string;
  lengthSec?: number;
  extra?: any;
  deletedAt?: Date;
}
