import type { StudyData, Topic, TopicLevel } from "./model";

const levelRank: Record<TopicLevel, number> = {
  "not-started": 0,
  weak: 1,
  learning: 2,
  strong: 3,
};

export function rankTopics(data: StudyData): Topic[] {
  const examByCourse = new Map(
    data.courses.map((course) => [course.id, Date.parse(course.examAt)]),
  );

  return data.topics
    .filter((topic) => topic.level !== "strong")
    .toSorted(
      (a, b) =>
        levelRank[a.level] - levelRank[b.level] ||
        Number(b.importance === "high") -
          Number(a.importance === "high") ||
        (examByCourse.get(a.courseId) ?? Number.POSITIVE_INFINITY) -
          (examByCourse.get(b.courseId) ?? Number.POSITIVE_INFINITY) ||
        a.name.localeCompare(b.name),
    )
    .slice(0, 5);
}

export function courseProgress(topics: Topic[]): number {
  if (topics.length === 0) return 0;

  const completed = topics.reduce(
    (sum, topic) => sum + levelRank[topic.level],
    0,
  );

  return Math.round((completed / (topics.length * levelRank.strong)) * 100);
}
