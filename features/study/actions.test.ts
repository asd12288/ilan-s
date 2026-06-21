// @vitest-environment node

import { describe, expect, it } from "vitest";

import seedJson from "@/data/study-data.seed.json";
import { studyDataSchema, type StudyData } from "./model";
import {
  applySubtopicUpdate,
  applyTopicLevelUpdate,
  applyTopicUpdate,
  topicLevelUpdateSchema,
  topicUpdateSchema,
} from "./topic-update";

const seed = studyDataSchema.parse(seedJson);
const now = new Date("2026-06-21T11:00:00.000Z");
const later = new Date("2026-06-22T11:00:00.000Z");

function seedWith(id: string, patch: Partial<StudyData["topics"][number]>): StudyData {
  return {
    ...seed,
    topics: seed.topics.map((topic) =>
      topic.id === id ? { ...topic, ...patch } : topic,
    ),
  };
}

describe("applyTopicUpdate", () => {
  it("updates only the selected topic", () => {
    const result = applyTopicUpdate(
      seed,
      {
        topicId: "logic-satisfiability",
        level: "strong",
        importance: "high",
        nextAction: "Solve exam question 1",
      },
      now,
    );

    expect(
      result.topics.find((topic) => topic.id === "logic-satisfiability"),
    ).toMatchObject({
      level: "strong",
      importance: "high",
      nextAction: "Solve exam question 1",
      lastStudiedAt: now.toISOString(),
    });
    expect(result.topics[0]).toEqual(seed.topics[0]);
  });

  it("rejects an unknown topic", () => {
    expect(() =>
      applyTopicUpdate(
        seed,
        {
          topicId: "missing",
          level: "weak",
          importance: "normal",
          nextAction: "",
        },
        now,
      ),
    ).toThrow("Topic not found");
  });
});

describe("applySubtopicUpdate", () => {
  it("updates only the selected subtopic", () => {
    const topic = seed.topics.find(
      (candidate) => candidate.id === "discrete-relations",
    );
    expect(topic?.subtopics.length).toBeGreaterThan(0);

    const subtopic = topic!.subtopics[0];
    const result = applySubtopicUpdate(seed, {
      topicId: topic!.id,
      subtopicId: subtopic.id,
      completed: true,
    });

    expect(
      result.topics
        .find((candidate) => candidate.id === topic!.id)
        ?.subtopics.find((candidate) => candidate.id === subtopic.id)
        ?.completed,
    ).toBe(true);
    expect(result.topics.find((candidate) => candidate.id !== topic!.id)).toEqual(
      seed.topics.find((candidate) => candidate.id !== topic!.id),
    );
  });

  it("rejects an unknown subtopic", () => {
    expect(() =>
      applySubtopicUpdate(seed, {
        topicId: "discrete-relations",
        subtopicId: "missing",
        completed: true,
      }),
    ).toThrow("Subtopic not found");
  });
});

describe("applyTopicLevelUpdate", () => {
  it("changes only the level and preserves importance and next action", () => {
    const data = seedWith("logic-satisfiability", {
      level: "weak",
      importance: "high",
      nextAction: "Keep me",
      lastStudiedAt: now.toISOString(),
    });

    const result = applyTopicLevelUpdate(
      data,
      { topicId: "logic-satisfiability", level: "strong" },
      later,
    );

    expect(
      result.topics.find((topic) => topic.id === "logic-satisfiability"),
    ).toMatchObject({
      level: "strong",
      importance: "high",
      nextAction: "Keep me",
      lastStudiedAt: later.toISOString(),
    });
  });

  it("keeps lastStudiedAt when the level does not change", () => {
    const data = seedWith("logic-satisfiability", {
      level: "learning",
      lastStudiedAt: now.toISOString(),
    });

    const result = applyTopicLevelUpdate(
      data,
      { topicId: "logic-satisfiability", level: "learning" },
      later,
    );

    expect(
      result.topics.find((topic) => topic.id === "logic-satisfiability")
        ?.lastStudiedAt,
    ).toBe(now.toISOString());
  });

  it("rejects an unknown topic", () => {
    expect(() =>
      applyTopicLevelUpdate(seed, { topicId: "missing", level: "weak" }, later),
    ).toThrow("Topic not found");
  });
});

describe("topicLevelUpdateSchema", () => {
  it("rejects an invalid level", () => {
    expect(
      topicLevelUpdateSchema.safeParse({
        topicId: "logic-truth-tables",
        level: "mastered",
      }).success,
    ).toBe(false);
  });
});

describe("topicUpdateSchema", () => {
  it("rejects next actions longer than 120 characters", () => {
    expect(
      topicUpdateSchema.safeParse({
        topicId: "logic-truth-tables",
        level: "weak",
        importance: "normal",
        nextAction: "x".repeat(121),
      }).success,
    ).toBe(false);
  });
});
