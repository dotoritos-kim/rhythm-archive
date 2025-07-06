export class CreateDlcDto {
  gameId: string;
  dlcName: string;
  releaseDate?: Date;
  extra?: any;
}

export class UpdateDlcDto {
  dlcName?: string;
  releaseDate?: Date;
  extra?: any;
  deletedAt?: Date;
}
