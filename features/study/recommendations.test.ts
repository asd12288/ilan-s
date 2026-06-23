import { describe, expect, it } from "vitest";

import type { StudyData } from "./model";
import { courseProgress, rankTopics } from "./recommendations";

const seedData: StudyData = {
  schemaVersion: 1,
  updatedAt: "2026-06-21T00:00:00.000Z",
  courses: [
    { id: "a", name: "A", shortName: "A", examAt: "2026-07-01T09:00:00+03:00", position: 0 },
    { id: "b", name: "B", shortName: "B", examAt: "2026-07-02T09:00:00+03:00", position: 1 },
  ],
  topics: [
    { id: "b-weak-high", courseId: "b", name: "Weak", level: "weak", importance: "high", subtopics: [], position: 0 },
    { id: "a-not-started-normal", courseId: "a", name: "Normal", level: "not-started", importance: "normal", subtopics: [], position: 1 },
    { id: "a-learning-high", courseId: "a", name: "Learning", level: "learning", importance: "high", subtopics: [], position: 2 },
    { id: "a-not-started-high", courseId: "a", name: "High", level: "not-started", importance: "high", subtopics: [], position: 3 },
    { id: "a-strong", courseId: "a", name: "Strong", level: "strong", importance: "high", subtopics: [], position: 4 },
  ],
};

describe("rankTopics", () => {
  it("ranks unfinished level, importance, then exam date", () => {
    const result = rankTopics(seedData);

    expect(result.map((topic) => topic.id)).toEqual([
      "a-not-started-high",
      "a-not-started-normal",
      "b-weak-high",
      "a-learning-high",
    ]);
  });

  it("excludes strong topics and returns at most five", () => {
    const result = rankTopics({
      ...seedData,
      topics: [...seedData.topics, ...seedData.topics.map((topic, index) => ({ ...topic, id: `${topic.id}-${index}` }))],
    });

    expect(result).toHaveLength(5);
    expect(result.every((topic) => topic.level !== "strong")).toBe(true);
  });
});

describe("courseProgress", () => {
  const withChecklists: StudyData["topics"] = [
    {
      id: "t1",
      courseId: "a",
      name: "T1",
      level: "weak",
      importance: "normal",
      position: 0,
      subtopics: [
        { id: "t1-a", name: "a", completed: true, position: 0 },
        { id: "t1-b", name: "b", completed: false, position: 1 },
      ],
    },
    {
      id: "t2",
      courseId: "a",
      name: "T2",
      level: "strong",
      importance: "normal",
      position: 1,
      subtopics: [
        { id: "t2-a", name: "a", completed: true, position: 0 },
        { id: "t2-b", name: "b", completed: true, position: 1 },
      ],
    },
  ];

  it("is the share of completed subtopics across the course", () => {
    // 3 of 4 subtopics completed → 75%
    expect(courseProgress(withChecklists)).toBe(75);
  });

  it("ignores level — only subtopics count", () => {
    // every topic strong, but no subtopics completed → 0%
    const allStrongNoneDone = withChecklists.map((topic) => ({
      ...topic,
      level: "strong" as const,
      subtopics: topic.subtopics.map((s) => ({ ...s, completed: false })),
    }));
    expect(courseProgress(allStrongNoneDone)).toBe(0);
  });

  it("returns zero when there are no subtopics", () => {
    expect(courseProgress([])).toBe(0);
    expect(courseProgress(seedData.topics.slice(0, 4))).toBe(0);
  });
});
