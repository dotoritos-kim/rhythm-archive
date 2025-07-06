export class CreateCourseEntryDto {
  courseId: string;
  chartId: string;
  position: number;
  extra?: any;
}

export class UpdateCourseEntryDto {
  position?: number;
  extra?: any;
  deletedAt?: Date;
}
