import type { Course, Topic } from "./model";
import { daysUntil } from "./format";
import { LevelMenu } from "./level-menu";
import { TopicEditor } from "./topic-editor";

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
          return (
            <div
              key={topic.id}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b px-0 py-2 sm:grid-cols-[minmax(0,1.6fr)_minmax(8rem,1fr)_8rem_8rem] sm:gap-4 sm:px-2"
            >
              <div className="min-w-0">
                <TopicEditor topic={topic} />
                <p className="mt-1 truncate text-xs text-muted-foreground sm:hidden">
                  {course?.shortName} · {course ? `${daysUntil(course.examAt)} ימים` : ""}
                </p>
              </div>
              <span className="hidden truncate text-sm text-muted-foreground sm:block">
                {course?.shortName}
              </span>
              <span className="hidden sm:block"><LevelMenu topicId={topic.id} level={topic.level} /></span>
              <span className="hidden text-center text-sm tabular-nums sm:block">
                {course ? daysUntil(course.examAt) : "—"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
