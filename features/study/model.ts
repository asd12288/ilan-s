import { z } from "zod";

export const topicLevelSchema = z.enum([
  "not-started",
  "weak",
  "learning",
  "strong",
]);

export const importanceSchema = z.enum(["normal", "high"]);

export const courseSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  shortName: z.string().min(1),
  examAt: z.iso.datetime({ offset: true }),
  secondExamAt: z.iso.datetime({ offset: true }).optional(),
  position: z.number().int().nonnegative(),
});

export const topicSchema = z.object({
  id: z.string().min(1),
  courseId: z.string().min(1),
  name: z.string().min(1),
  level: topicLevelSchema,
  importance: importanceSchema,
  lastStudiedAt: z.iso.datetime({ offset: true }).optional(),
  nextAction: z.string().trim().max(120).optional(),
  position: z.number().int().nonnegative(),
});

export const studyDataSchema = z
  .object({
    schemaVersion: z.literal(1),
    updatedAt: z.iso.datetime({ offset: true }),
    courses: z.array(courseSchema),
    topics: z.array(topicSchema),
  })
  .superRefine((data, context) => {
    const courseIds = new Set(data.courses.map((course) => course.id));

    data.topics.forEach((topic, index) => {
      if (!courseIds.has(topic.courseId)) {
        context.addIssue({
          code: "custom",
          path: ["topics", index, "courseId"],
          message: `Unknown course ${topic.courseId}`,
        });
      }
    });
  });

export type StudyData = z.infer<typeof studyDataSchema>;
export type Course = z.infer<typeof courseSchema>;
export type Topic = z.infer<typeof topicSchema>;
export type TopicLevel = z.infer<typeof topicLevelSchema>;
export type Importance = z.infer<typeof importanceSchema>;
