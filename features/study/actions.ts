"use server";

import { revalidatePath } from "next/cache";

import { requireSession } from "@/features/auth/session";

import {
  StudyDataConflictError,
  updateStudyData,
} from "./repository";
import {
  applyAddSubtopic,
  applyRemoveSubtopic,
  applySubtopicUpdate,
  applyTopicLevelUpdate,
  applyTopicUpdate,
  subtopicAddSchema,
  subtopicRemoveSchema,
  subtopicUpdateSchema,
  topicLevelUpdateSchema,
  topicUpdateSchema,
} from "./topic-update";

export type TopicActionState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };

export type TopicLevelResult =
  | { status: "success" }
  | { status: "error"; message: string };

export type SubtopicResult = TopicLevelResult;

export async function updateTopicAction(
  _previousState: TopicActionState,
  formData: FormData,
): Promise<TopicActionState> {
  await requireSession();

  const parsed = topicUpdateSchema.safeParse({
    topicId: formData.get("topicId"),
    level: formData.get("level"),
    importance: formData.get("importance"),
    nextAction: formData.get("nextAction") ?? "",
  });

  if (!parsed.success) {
    return { status: "error", message: "בדקו את שדות הנושא" };
  }

  try {
    const stored = await updateStudyData((data) =>
      applyTopicUpdate(data, parsed.data),
    );
    const topic = stored.data.topics.find(
      (candidate) => candidate.id === parsed.data.topicId,
    );

    revalidatePath("/");
    revalidatePath("/topics");
    if (topic) revalidatePath(`/courses/${topic.courseId}`);

    return { status: "success" };
  } catch (error) {
    if (error instanceof StudyDataConflictError) {
      return {
        status: "error",
        message: "הנתונים השתנו במכשיר אחר. רעננו ונסו שוב.",
      };
    }
    throw error;
  }
}

export async function updateTopicLevelAction(
  topicId: string,
  level: unknown,
): Promise<TopicLevelResult> {
  await requireSession();

  const parsed = topicLevelUpdateSchema.safeParse({ topicId, level });
  if (!parsed.success) {
    return { status: "error", message: "רמה לא תקינה" };
  }

  try {
    const stored = await updateStudyData((data) =>
      applyTopicLevelUpdate(data, parsed.data),
    );
    const topic = stored.data.topics.find(
      (candidate) => candidate.id === parsed.data.topicId,
    );

    revalidatePath("/");
    revalidatePath("/topics");
    if (topic) revalidatePath(`/courses/${topic.courseId}`);

    return { status: "success" };
  } catch (error) {
    if (error instanceof StudyDataConflictError) {
      return {
        status: "error",
        message: "הנתונים השתנו במכשיר אחר. רעננו ונסו שוב.",
      };
    }
    throw error;
  }
}

export async function updateSubtopicAction(
  topicId: string,
  subtopicId: string,
  completed: unknown,
): Promise<SubtopicResult> {
  await requireSession();

  const parsed = subtopicUpdateSchema.safeParse({
    topicId,
    subtopicId,
    completed,
  });
  if (!parsed.success) {
    return { status: "error", message: "מצב לא תקין" };
  }

  try {
    const stored = await updateStudyData((data) =>
      applySubtopicUpdate(data, parsed.data),
    );
    const topic = stored.data.topics.find(
      (candidate) => candidate.id === parsed.data.topicId,
    );

    revalidatePath("/");
    revalidatePath("/topics");
    if (topic) revalidatePath(`/courses/${topic.courseId}`);

    return { status: "success" };
  } catch (error) {
    if (error instanceof StudyDataConflictError) {
      return {
        status: "error",
        message: "הנתונים השתנו במכשיר אחר. רעננו ונסו שוב.",
      };
    }
    throw error;
  }
}

export async function addSubtopicAction(
  topicId: string,
  subtopicId: string,
  name: unknown,
): Promise<SubtopicResult> {
  await requireSession();

  const parsed = subtopicAddSchema.safeParse({ topicId, subtopicId, name });
  if (!parsed.success) {
    return { status: "error", message: "שם תת-נושא לא תקין" };
  }

  try {
    const stored = await updateStudyData((data) =>
      applyAddSubtopic(data, parsed.data),
    );
    const topic = stored.data.topics.find(
      (candidate) => candidate.id === parsed.data.topicId,
    );

    revalidatePath("/");
    revalidatePath("/topics");
    if (topic) revalidatePath(`/courses/${topic.courseId}`);

    return { status: "success" };
  } catch (error) {
    if (error instanceof StudyDataConflictError) {
      return {
        status: "error",
        message: "הנתונים השתנו במכשיר אחר. רעננו ונסו שוב.",
      };
    }
    throw error;
  }
}

export async function removeSubtopicAction(
  topicId: string,
  subtopicId: string,
): Promise<SubtopicResult> {
  await requireSession();

  const parsed = subtopicRemoveSchema.safeParse({ topicId, subtopicId });
  if (!parsed.success) {
    return { status: "error", message: "מצב לא תקין" };
  }

  try {
    const stored = await updateStudyData((data) =>
      applyRemoveSubtopic(data, parsed.data),
    );
    const topic = stored.data.topics.find(
      (candidate) => candidate.id === parsed.data.topicId,
    );

    revalidatePath("/");
    revalidatePath("/topics");
    if (topic) revalidatePath(`/courses/${topic.courseId}`);

    return { status: "success" };
  } catch (error) {
    if (error instanceof StudyDataConflictError) {
      return {
        status: "error",
        message: "הנתונים השתנו במכשיר אחר. רעננו ונסו שוב.",
      };
    }
    throw error;
  }
}
