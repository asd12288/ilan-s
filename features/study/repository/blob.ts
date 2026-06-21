import {
  BlobPreconditionFailedError,
  get,
  head,
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
      if (!result || result.statusCode !== 200) return null;

      const text = await new Response(result.stream).text();
      // The etag from `get` (a CDN/download response for a private blob) is not
      // the canonical storage etag that `put({ ifMatch })` validates against.
      // Use `head` so the version we hand back matches what a conditional write
      // expects — otherwise every overwrite fails with a spurious conflict.
      const meta = await head(pathname);
      return {
        data: studyDataSchema.parse(JSON.parse(text)),
        version: meta.etag,
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
