"use client";

import { PageHeader } from "@/components/page-header";
import { CourseProgress } from "@/features/study/course-progress";
import { RecommendedTopics } from "@/features/study/recommended-topics";
import { courseProgress, rankTopics } from "@/features/study/recommendations";
import { useStudy } from "@/features/study/study-store";

export default function StudyPage() {
  const { data } = useStudy();
  const courses = data.courses.toSorted((a, b) => a.position - b.position);

  return (
    <>
      <PageHeader title="ללמוד עכשיו" />
      <RecommendedTopics topics={rankTopics(data)} courses={courses} />

      <section className="mt-12 sm:mt-16">
        <h2 className="mb-4 text-lg font-semibold tracking-[-0.015em]">קורסים</h2>
        <div>
          {courses.map((course) => (
            <CourseProgress
              key={course.id}
              course={course}
              progress={courseProgress(data.topics.filter((topic) => topic.courseId === course.id))}
            />
          ))}
        </div>
      </section>
    </>
  );
}
