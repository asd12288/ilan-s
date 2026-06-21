import { z } from "zod";

import {
  importanceSchema,
  type StudyData,
  topicLevelSchema,
} from "./model";

export const topicUpdateSchema = z.object({
  topicId: z.string().min(1),
  level: topicLevelSchema,
  importance: importanceSchema,
  nextAction: z.string().trim().max(120),
});

export const topicLevelUpdateSchema = z.object({
  topicId: z.string().min(1),
  level: topicLevelSchema,
});

export const subtopicUpdateSchema = z.object({
  topicId: z.string().min(1),
  subtopicId: z.string().min(1),
  completed: z.boolean(),
});

type TopicUpdate = z.infer<typeof topicUpdateSchema>;
type TopicLevelUpdate = z.infer<typeof topicLevelUpdateSchema>;
type SubtopicUpdate = z.infer<typeof subtopicUpdateSchema>;

export function applySubtopicUpdate(
  data: StudyData,
  update: SubtopicUpdate,
): StudyData {
  const topic = data.topics.find((candidate) => candidate.id === update.topicId);
  if (!topic) throw new Error("Topic not found");
  if (!topic.subtopics.some((subtopic) => subtopic.id === update.subtopicId)) {
    throw new Error("Subtopic not found");
  }

  return {
    ...data,
    topics: data.topics.map((candidate) =>
      candidate.id === update.topicId
        ? {
            ...candidate,
            subtopics: candidate.subtopics.map((subtopic) =>
              subtopic.id === update.subtopicId
                ? { ...subtopic, completed: update.completed }
                : subtopic,
            ),
          }
        : candidate,
    ),
  };
}

export function applyTopicLevelUpdate(
  data: StudyData,
  update: TopicLevelUpdate,
  now = new Date(),
): StudyData {
  const current = data.topics.find((topic) => topic.id === update.topicId);
  if (!current) throw new Error("Topic not found");

  return {
    ...data,
    topics: data.topics.map((topic) =>
      topic.id === update.topicId
        ? {
            ...topic,
            level: update.level,
            lastStudiedAt:
              topic.level === update.level
                ? topic.lastStudiedAt
                : now.toISOString(),
          }
        : topic,
    ),
  };
}

export function applyTopicUpdate(
  data: StudyData,
  update: TopicUpdate,
  now = new Date(),
): StudyData {
  const current = data.topics.find((topic) => topic.id === update.topicId);
  if (!current) throw new Error("Topic not found");

  return {
    ...data,
    topics: data.topics.map((topic) =>
      topic.id === update.topicId
        ? {
            ...topic,
            level: update.level,
            importance: update.importance,
            nextAction: update.nextAction || undefined,
            lastStudiedAt:
              topic.level === update.level
                ? topic.lastStudiedAt
                : now.toISOString(),
          }
        : topic,
    ),
  };
}
