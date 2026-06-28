import { cn } from "@/lib/utils";

import type { Course, Topic } from "./model";
import { daysUntil, examUrgency } from "./format";
import { LevelMenu } from "./level-menu";
import { TopicEditor } from "./topic-editor";

const urgencyTone: Record<ReturnType<typeof examUrgency>, string> = {
  urgent: "text-destructive font-medium",
  soon: "text-status-weak font-medium",
  normal: "",
};

export function RecommendedTopics({
  topics,
  courses,
}: {
  topics: Topic[];
  courses: Course[];
}) {
  const courseById = new Map(courses.map((course) => [course.id, course]));

  return (
    <div>
      <div className="hidden grid-cols-[minmax(0,1.6fr)_minmax(8rem,1fr)_8rem_8rem] gap-4 border-b px-2 py-3 text-sm font-medium text-muted-foreground sm:grid">
        <span>נושא</span>
        <span>קורס</span>
        <span>סטטוס</span>
        <span>ימים עד הבחינה</span>
      </div>
      <div className="divide-y">
        {topics.map((topic) => {
          const course = courseById.get(topic.courseId);
          const days = course ? daysUntil(course.examAt) : null;
          const tone = days === null ? "" : urgencyTone[examUrgency(days)];
          const nextAction = topic.nextAction?.trim();

          return (
            <div
              key={topic.id}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b px-0 py-2 sm:grid-cols-[minmax(0,1.6fr)_minmax(8rem,1fr)_8rem_8rem] sm:gap-4 sm:px-2"
            >
              <div className="min-w-0">
                <TopicEditor topic={topic} />
                {nextAction ? (
                  <p className="mt-1 truncate px-3 text-xs text-muted-foreground">
                    {nextAction}
                  </p>
                ) : null}
                <p className="mt-1 truncate text-xs text-muted-foreground sm:hidden">
                  {course?.shortName}
                  {days !== null && (
                    <> · <span className={tone}>{`${days} ימים`}</span></>
                  )}
                </p>
              </div>
              <span className="hidden truncate text-sm text-muted-foreground sm:block">
                {course?.shortName}
              </span>
              <span className="hidden sm:block"><LevelMenu topicId={topic.id} level={topic.level} /></span>
              <span className={cn("hidden text-center text-sm tabular-nums sm:block", tone)}>
                {days ?? "—"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
