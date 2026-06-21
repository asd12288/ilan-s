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
  it("averages level weights into a percentage", () => {
    expect(courseProgress(seedData.topics.slice(0, 4))).toBe(25);
  });

  it("returns zero for an empty course", () => {
    expect(courseProgress([])).toBe(0);
  });
});
