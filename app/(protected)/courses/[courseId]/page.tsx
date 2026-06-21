"use client";

import { notFound, useParams } from "next/navigation";

import { PageHeader } from "@/components/page-header";
import { Progress } from "@/components/ui/progress";
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
  const examTone = urgencyTone[examUrgency(daysUntil(course.examAt))];

  return (
    <>
      <PageHeader
        title={course.name}
        icon={<CourseIcon courseId={course.id} className="size-7 shrink-0 sm:size-8" />}
      />
      <div className="mb-8 flex items-center gap-4 text-sm text-muted-foreground">
        <span className={examTone}>{formatExamDate(course.examAt)}</span>
        <Progress value={progress} className="h-1.5 max-w-48" />
        <span className="font-medium tabular-nums text-foreground">{progress}%</span>
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
