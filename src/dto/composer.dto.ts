export class CreateComposerDto {
  name: string;
  companyName?: string;
  extra?: any;
}

export class UpdateComposerDto {
  name?: string;
  companyName?: string;
  extra?: any;
  deletedAt?: Date;
}
