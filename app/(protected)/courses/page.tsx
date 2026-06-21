"use client";

import { PageHeader } from "@/components/page-header";
import { CourseProgress } from "@/features/study/course-progress";
import { courseProgress } from "@/features/study/recommendations";
import { useStudy } from "@/features/study/study-store";

export default function CoursesPage() {
  const { data } = useStudy();

  return (
    <>
      <PageHeader title="קורסים" />
      <div>
        {data.courses
          .toSorted((a, b) => a.position - b.position)
          .map((course) => (
            <CourseProgress
              key={course.id}
              course={course}
              progress={courseProgress(data.topics.filter((topic) => topic.courseId === course.id))}
            />
          ))}
      </div>
    </>
  );
}
