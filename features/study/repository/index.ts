import seedJson from "@/data/study-data.seed.json";

import { studyDataSchema, type StudyData } from "../model";
import { createBlobStudyRepository } from "./blob";
import { createLocalFileStudyRepository } from "./local-file";
import type { StoredStudyData, StudyRepository } from "./types";

const seedData = studyDataSchema.parse(seedJson);

export function getStudyRepository(): StudyRepository {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    return createBlobStudyRepository();
  }
  if (process.env.VERCEL) {
    throw new Error("BLOB_READ_WRITE_TOKEN is required on Vercel");
  }
  return createLocalFileStudyRepository();
}

export async function readStudyDataWith(
  repository: StudyRepository,
): Promise<StudyData> {
  return (await repository.read())?.data ?? seedData;
}

export async function readStudyData(): Promise<StudyData> {
  return readStudyDataWith(getStudyRepository());
}

export async function updateStudyDataWith(
  repository: StudyRepository,
  updater: (data: StudyData) => StudyData,
  now = new Date(),
): Promise<StoredStudyData> {
  const stored = await repository.read();
  const current = stored?.data ?? seedData;
  const updated = studyDataSchema.parse({
    ...updater(current),
    updatedAt: now.toISOString(),
  });

  return repository.write(updated, stored?.version);
}

export async function updateStudyData(
  updater: (data: StudyData) => StudyData,
): Promise<StoredStudyData> {
  return updateStudyDataWith(getStudyRepository(), updater);
}

export type { StoredStudyData, StudyRepository } from "./types";
export { StudyDataConflictError } from "./types";
