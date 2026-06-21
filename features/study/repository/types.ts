import type { StudyData } from "../model";

export type StoredStudyData = {
  data: StudyData;
  version?: string;
};

export interface StudyRepository {
  read(): Promise<StoredStudyData | null>;
  write(data: StudyData, expectedVersion?: string): Promise<StoredStudyData>;
}

export class StudyDataConflictError extends Error {
  constructor() {
    super("Study data changed elsewhere");
    this.name = "StudyDataConflictError";
  }
}
