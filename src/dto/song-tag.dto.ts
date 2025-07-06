export class CreateSongTagDto {
  songId: string;
  tagId: string;
}

export class UpdateSongTagDto {
  deletedAt?: Date;
}
