export class CreateSongGameVersionDto {
  songId: string;
  gameId: string;
  dlcId?: string;
  inGameTitle?: string;
  bpmOverride?: number;
  lengthSec?: number;
  arrangement?: string;
  firstVersion?: string;
  firstDate?: Date;
  extra?: any;
}

export class UpdateSongGameVersionDto {
  dlcId?: string;
  inGameTitle?: string;
  bpmOverride?: number;
  lengthSec?: number;
  arrangement?: string;
  firstVersion?: string;
  firstDate?: Date;
  extra?: any;
  deletedAt?: Date;
}
