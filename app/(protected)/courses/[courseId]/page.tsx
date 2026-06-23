"use client";

import { notFound, useParams } from "next/navigation";
import { CalendarDaysIcon } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { CourseIcon } from "@/features/study/course-icon";
import { daysUntil, examUrgency, formatExamDate } from "@/features/study/format";
import { courseProgress } from "@/features/study/recommendations";
import { useStudy } from "@/features/study/study-store";
import { TopicChecklistRow } from "@/features/study/topic-checklist-row";

const urgencyTone = {
  urgent: "text-destructive font-medium",
  soon: "text-status-weak font-medium",
  normal: "",
} as const;

export default function CoursePage() {
  const params = useParams<{ courseId: string }>();
  const { data } = useStudy();

  const course = data.courses.find((candidate) => candidate.id === params.courseId);
  if (!course) notFound();

  const topics = data.topics
    .filter((topic) => topic.courseId === course.id)
    .toSorted((a, b) => a.position - b.position);
  const progress = courseProgress(topics);
  const days = daysUntil(course.examAt);
  const examTone = urgencyTone[examUrgency(days)];

  return (
    <>
      <PageHeader
        title={course.name}
        icon={<CourseIcon courseId={course.id} className="size-7 shrink-0 sm:size-8" />}
      />
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-3 rounded-2xl border bg-card px-4 py-2.5">
          <CalendarDaysIcon className="size-5 shrink-0 text-muted-foreground" />
          <div className="flex flex-col">
            <span className={cn("text-xl font-semibold leading-none tabular-nums", examTone)}>
              {days} ימים לבחינה
            </span>
            <span className="mt-1 text-xs text-muted-foreground">
              {formatExamDate(course.examAt)}
            </span>
          </div>
        </div>
        <div className="flex min-w-44 flex-1 items-center gap-3">
          <Progress value={progress} className="h-2.5" />
          <span className="text-sm font-medium tabular-nums">{progress}%</span>
        </div>
      </div>

      <div>
        <div>
          {topics.map((topic) => (
            <TopicChecklistRow key={topic.id} topic={topic} />
          ))}
        </div>
      </div>
    </>
  );
}
