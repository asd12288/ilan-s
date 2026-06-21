import {
  BlobPreconditionFailedError,
  get,
  put,
} from "@vercel/blob";

import { studyDataSchema, type StudyData } from "../model";
import { StudyDataConflictError, type StudyRepository } from "./types";

const pathname = "study-data/v1.json";

export function createBlobStudyRepository(): StudyRepository {
  return {
    async read() {
      const result = await get(pathname, {
        access: "private",
        useCache: false,
      });
      if (!result) return null;

      const text = await new Response(result.stream).text();
      return {
        data: studyDataSchema.parse(JSON.parse(text)),
        version: result.blob.etag,
      };
    },

    async write(data: StudyData, expectedVersion?: string) {
      try {
        const result = await put(pathname, JSON.stringify(data, null, 2), {
          access: "private",
          addRandomSuffix: false,
          allowOverwrite: Boolean(expectedVersion),
          contentType: "application/json",
          ifMatch: expectedVersion,
        });

        return { data, version: result.etag };
      } catch (error) {
        if (error instanceof BlobPreconditionFailedError) {
          throw new StudyDataConflictError();
        }
        throw error;
      }
    },
  };
}
