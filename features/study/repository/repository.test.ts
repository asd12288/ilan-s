// @vitest-environment node

import { describe, expect, it } from "vitest";

import seedJson from "@/data/study-data.seed.json";
import { studyDataSchema } from "../model";
import { readStudyDataWith, updateStudyDataWith } from "./index";
import type { StoredStudyData, StudyRepository } from "./types";

const seed = studyDataSchema.parse(seedJson);

function fakeRepository(initial: StoredStudyData | null): StudyRepository & {
  writes: Array<{ data: StoredStudyData["data"]; expectedVersion?: string }>;
} {
  let stored = initial;
  const writes: Array<{
    data: StoredStudyData["data"];
    expectedVersion?: string;
  }> = [];

  return {
    writes,
    async read() {
      return stored;
    },
    async write(data, expectedVersion) {
      writes.push({ data, expectedVersion });
      stored = { data, version: "etag-2" };
      return stored;
    },
  };
}

describe("study repository orchestration", () => {
  it("returns the seed when storage is empty", async () => {
    const repository = fakeRepository(null);

    const result = await readStudyDataWith(repository);

    expect(result.courses).toHaveLength(6);
    expect(repository.writes).toHaveLength(0);
  });

  it("updates and validates the complete document", async () => {
    const repository = fakeRepository({ data: seed, version: "etag-1" });
    const now = new Date("2026-06-21T10:00:00.000Z");

    const result = await updateStudyDataWith(
      repository,
      (data) => ({
        ...data,
        topics: data.topics.map((topic) =>
          topic.id === "logic-truth-tables"
            ? { ...topic, level: "strong" as const }
            : topic,
        ),
      }),
      now,
    );

    expect(
      result.data.topics.find((topic) => topic.id === "logic-truth-tables")
        ?.level,
    ).toBe("strong");
    expect(result.data.updatedAt).toBe(now.toISOString());
    expect(repository.writes[0]?.expectedVersion).toBe("etag-1");
  });
});
