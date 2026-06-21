import { createHash } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import { studyDataSchema, type StudyData } from "../model";
import { StudyDataConflictError, type StudyRepository } from "./types";

const dataPath = path.join(process.cwd(), "data", "study-data.local.json");

function versionFor(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function createLocalFileStudyRepository(): StudyRepository {
  return {
    async read() {
      try {
        const raw = await readFile(dataPath, "utf8");
        return {
          data: studyDataSchema.parse(JSON.parse(raw)),
          version: versionFor(raw),
        };
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
        throw error;
      }
    },

    async write(data: StudyData, expectedVersion?: string) {
      const current = await this.read();
      if (expectedVersion && current?.version !== expectedVersion) {
        throw new StudyDataConflictError();
      }

      const raw = `${JSON.stringify(data, null, 2)}\n`;
      const temporaryPath = `${dataPath}.tmp`;
      await mkdir(path.dirname(dataPath), { recursive: true });
      await writeFile(temporaryPath, raw, "utf8");
      await rename(temporaryPath, dataPath);

      return { data, version: versionFor(raw) };
    },
  };
}
