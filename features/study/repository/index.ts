import seedJson from "@/data/study-data.seed.json";

import { studyDataSchema, type StudyData } from "../model";
import { createBlobStudyRepository } from "./blob";
import { createLocalFileStudyRepository } from "./local-file";
import {
  StudyDataConflictError,
  type StoredStudyData,
  type StudyRepository,
} from "./types";

const seedData = studyDataSchema.parse(seedJson);
const managedCourseIds = new Set([
  "discrete-mathematics",
  "mathematical-logic",
  "linear-algebra",
  "programming-2",
]);

function withSeedCatalog(data: StudyData): StudyData {
  const storedTopicById = new Map(
    data.topics.map((topic) => [topic.id, topic]),
  );
  const unmanagedTopics = data.topics.filter(
    (topic) => !managedCourseIds.has(topic.courseId),
  );
  const managedTopics = seedData.topics
    .filter((topic) => managedCourseIds.has(topic.courseId))
    .map((catalogTopic) => {
      const storedTopic = storedTopicById.get(catalogTopic.id);
      const storedSubtopicById = new Map(
        storedTopic?.subtopics.map((subtopic) => [subtopic.id, subtopic]) ?? [],
      );

      return {
        ...catalogTopic,
        level: storedTopic?.level ?? catalogTopic.level,
        importance: storedTopic?.importance ?? catalogTopic.importance,
        lastStudiedAt: storedTopic?.lastStudiedAt,
        nextAction: storedTopic?.nextAction,
        subtopics: catalogTopic.subtopics.map((catalogSubtopic) => ({
          ...catalogSubtopic,
          completed:
            storedSubtopicById.get(catalogSubtopic.id)?.completed ??
            catalogSubtopic.completed,
        })),
      };
    });

  return {
    ...data,
    topics: [...unmanagedTopics, ...managedTopics],
  };
}

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
  const stored = await repository.read();
  return stored ? withSeedCatalog(stored.data) : seedData;
}

export async function readStudyData(): Promise<StudyData> {
  return readStudyDataWith(getStudyRepository());
}

export async function updateStudyDataWith(
  repository: StudyRepository,
  updater: (data: StudyData) => StudyData,
  now = new Date(),
): Promise<StoredStudyData> {
  // Compare-and-swap: read the latest, apply the change on top of it, and write
  // conditionally. If another write landed in between (conflict), re-read and
  // re-apply rather than failing or clobbering the newer data.
  let lastConflict: StudyDataConflictError | undefined;
  for (let attempt = 0; attempt < 3; attempt++) {
    const stored = await repository.read();
    const current = stored ? withSeedCatalog(stored.data) : seedData;
    const updated = studyDataSchema.parse({
      ...updater(current),
      updatedAt: now.toISOString(),
    });

    try {
      return await repository.write(updated, stored?.version);
    } catch (error) {
      if (error instanceof StudyDataConflictError) {
        lastConflict = error;
        continue;
      }
      throw error;
    }
  }

  throw lastConflict ?? new StudyDataConflictError();
}

export async function updateStudyData(
  updater: (data: StudyData) => StudyData,
): Promise<StoredStudyData> {
  return updateStudyDataWith(getStudyRepository(), updater);
}

export type { StoredStudyData, StudyRepository } from "./types";
export { StudyDataConflictError } from "./types";
