import { describe, expect, it } from "vitest";

import { studyDataSchema } from "./model";
import seedData from "@/data/study-data.seed.json";

describe("studyDataSchema", () => {
  it("accepts the bundled course and topic seed", () => {
    const result = studyDataSchema.parse(seedData);

    expect(result.courses).toHaveLength(6);
    expect(result.topics.length).toBeGreaterThan(100);
  });

  it("accepts a version-one study document", () => {
    const result = studyDataSchema.parse({
      schemaVersion: 1,
      updatedAt: "2026-06-21T00:00:00.000Z",
      courses: [
        {
          id: "logic",
          name: "Mathematical Logic",
          shortName: "Logic",
          examAt: "2026-07-10T09:00:00+03:00",
          position: 1,
        },
      ],
      topics: [
        {
          id: "logic-truth-tables",
          courseId: "logic",
          name: "Truth tables",
          level: "weak",
          importance: "normal",
          position: 1,
        },
      ],
    });

    expect(result.schemaVersion).toBe(1);
  });

  it("rejects topics that point to a missing course", () => {
    const result = studyDataSchema.safeParse({
      schemaVersion: 1,
      updatedAt: "2026-06-21T00:00:00.000Z",
      courses: [],
      topics: [
        {
          id: "logic-truth-tables",
          courseId: "missing",
          name: "Truth tables",
          level: "weak",
          importance: "normal",
          position: 1,
        },
      ],
    });

    expect(result.success).toBe(false);
  });
});
