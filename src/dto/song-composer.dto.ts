export class CreateSongComposerDto {
  songId: string;
  composerId: string;
}

export class UpdateSongComposerDto {
  deletedAt?: Date;
}
