import Link from "next/link";
import { ChevronLeftIcon } from "lucide-react";

import { Progress } from "@/components/ui/progress";

import { CourseIcon } from "./course-icon";
import type { Course } from "./model";

export function CourseProgress({
  course,
  progress,
}: {
  course: Course;
  progress: number;
}) {
  return (
    <Link
      href={`/courses/${course.id}`}
      className="grid grid-cols-[1.5rem_minmax(0,1fr)_minmax(6rem,1.4fr)_3.5rem_1.5rem] items-center gap-4 border-b px-2 py-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <CourseIcon courseId={course.id} />
      <span className="truncate text-sm font-medium">{course.name}</span>
      <Progress value={progress} className="h-1.5" />
      <span className="text-end text-sm font-medium tabular-nums">{progress}%</span>
      <ChevronLeftIcon className="text-muted-foreground" />
    </Link>
  );
}
