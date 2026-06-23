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

  it("keeps user-owned subtopics on a stored topic (does not re-seed)", async () => {
    // Subtopics are user-owned: a stored topic that has had its subtopics
    // emptied stays empty rather than being refilled from the catalog.
    const withoutSubtopics = {
      ...seed,
      topics: seed.topics.map((topic) =>
        topic.id === "discrete-relations" ? { ...topic, subtopics: [] } : topic,
      ),
    };
    const repository = fakeRepository({
      data: withoutSubtopics,
      version: "etag-1",
    });

    const result = await readStudyDataWith(repository);

    expect(
      result.topics.find((topic) => topic.id === "discrete-relations")
        ?.subtopics.length,
    ).toBe(0);
  });

  it("seeds subtopics for a managed topic missing from storage", async () => {
    // The catalog still supplies the hierarchy for topics never stored.
    const withoutTopic = {
      ...seed,
      topics: seed.topics.filter((topic) => topic.id !== "discrete-relations"),
    };
    const repository = fakeRepository({ data: withoutTopic, version: "etag-1" });

    const result = await readStudyDataWith(repository);

    expect(
      result.topics.find((topic) => topic.id === "discrete-relations")
        ?.subtopics.length,
    ).toBeGreaterThan(0);
  });

  it("replaces an older managed catalog and preserves matching progress", async () => {
    const stored = {
      ...seed,
      topics: [
        ...seed.topics.filter(
          (topic) => topic.courseId !== "linear-algebra",
        ),
        {
          id: "linear-systems",
          courseId: "linear-algebra",
          name: "שם ישן",
          level: "weak" as const,
          importance: "high" as const,
          subtopics: [],
          position: 0,
        },
        {
          id: "linear-obsolete",
          courseId: "linear-algebra",
          name: "נושא ישן",
          level: "not-started" as const,
          importance: "normal" as const,
          subtopics: [],
          position: 1,
        },
      ],
    };
    const repository = fakeRepository({ data: stored, version: "etag-1" });

    const result = await readStudyDataWith(repository);
    const linearTopics = result.topics.filter(
      (topic) => topic.courseId === "linear-algebra",
    );
    const systems = linearTopics.find(
      (topic) => topic.id === "linear-systems",
    );

    expect(linearTopics).toHaveLength(6);
    expect(linearTopics.some((topic) => topic.id === "linear-obsolete")).toBe(
      false,
    );
    expect(systems).toMatchObject({
      name: "מערכות משוואות לינאריות",
      level: "weak",
      importance: "high",
    });
    // Subtopics are user-owned: the stored (empty) list is preserved, not
    // refilled from the catalog. Topic identity/name/progress still sync.
    expect(systems?.subtopics).toHaveLength(0);
  });

  it("uses the seeded topic hierarchy for mathematical logic", async () => {
    const repository = fakeRepository({ data: seed, version: "etag-1" });

    const result = await readStudyDataWith(repository);
    const logicTopics = result.topics.filter(
      (topic) => topic.courseId === "mathematical-logic",
    );

    expect(logicTopics).toHaveLength(8);
    expect(logicTopics.every((topic) => topic.subtopics.length > 0)).toBe(true);
  });

  it("uses the seeded topic hierarchy for programming", async () => {
    const repository = fakeRepository({ data: seed, version: "etag-1" });

    const result = await readStudyDataWith(repository);
    const programmingTopics = result.topics.filter(
      (topic) => topic.courseId === "programming-2",
    );

    expect(programmingTopics).toHaveLength(11);
    expect(programmingTopics.every((topic) => topic.subtopics.length > 0)).toBe(
      true,
    );
  });

  it("updates and validates the complete document", async () => {
    const repository = fakeRepository({ data: seed, version: "etag-1" });
    const now = new Date("2026-06-21T10:00:00.000Z");

    const result = await updateStudyDataWith(
      repository,
      (data) => ({
        ...data,
        topics: data.topics.map((topic) =>
          topic.id === "logic-satisfiability"
            ? { ...topic, level: "strong" as const }
            : topic,
        ),
      }),
      now,
    );

    expect(
      result.data.topics.find((topic) => topic.id === "logic-satisfiability")
        ?.level,
    ).toBe("strong");
    expect(result.data.updatedAt).toBe(now.toISOString());
    expect(repository.writes[0]?.expectedVersion).toBe("etag-1");
  });
});
