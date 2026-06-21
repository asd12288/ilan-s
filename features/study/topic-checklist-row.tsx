"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

import { CourseIcon } from "./course-icon";
import { LevelMenu } from "./level-menu";
import type { Subtopic, Topic } from "./model";
import { useStudy } from "./study-store";
import { TopicEditor } from "./topic-editor";

function SubtopicToggle({
  topicId,
  subtopic,
}: {
  topicId: string;
  subtopic: Subtopic;
}) {
  const { toggleSubtopic } = useStudy();
  const completed = subtopic.completed;
  const controlId = `${topicId}-${subtopic.id}`;

  function onCheckedChange(next: boolean) {
    if (next !== completed) toggleSubtopic(topicId, subtopic.id, next);
  }

  return (
    <label
      htmlFor={controlId}
      className={cn(
        "flex min-h-10 cursor-pointer items-center justify-between gap-4 py-2 text-sm",
        completed && "text-muted-foreground",
      )}
    >
      <span className={cn(completed && "line-through")}>{subtopic.name}</span>
      <Switch
        id={controlId}
        size="sm"
        checked={completed}
        onCheckedChange={onCheckedChange}
        aria-label={`${subtopic.name}: ${completed ? "עשיתי" : "לא עשיתי"}`}
      />
    </label>
  );
}

export function TopicChecklistRow({
  topic,
  courseName,
}: {
  topic: Topic;
  courseName?: string;
}) {
  const subtopics = topic.subtopics.toSorted((a, b) => a.position - b.position);
  const completed = subtopics.filter((subtopic) => subtopic.completed).length;
  const hasChecklist = subtopics.length > 0;

  if (!hasChecklist) {
    return (
      <div
        className={cn(
          "grid grid-cols-[minmax(0,1fr)_auto_7rem] items-center gap-2 border-b py-2",
          courseName &&
            "sm:grid-cols-[minmax(0,1.4fr)_minmax(8rem,1fr)_auto_7rem]",
        )}
      >
        <TopicEditor topic={topic} />
        {courseName ? (
          <span className="hidden truncate text-sm text-muted-foreground sm:block">
            {courseName}
          </span>
        ) : null}
        <span />
        <LevelMenu topicId={topic.id} level={topic.level} />
      </div>
    );
  }

  return (
    <Collapsible className="group/topic border-b">
      <div
        className={cn(
          "grid grid-cols-[minmax(0,1fr)_auto_7rem] items-center gap-2 py-2",
          courseName &&
            "sm:grid-cols-[minmax(0,1.4fr)_minmax(8rem,1fr)_auto_7rem]",
        )}
      >
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex min-w-0 items-center gap-2 rounded-md px-2 py-1.5 text-right text-sm font-medium outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/30 [&_svg]:size-4"
          >
            <CourseIcon courseId={topic.courseId} className="shrink-0" aria-hidden />
            <span className="truncate">{topic.name}</span>
            <span className="shrink-0 text-xs font-normal tabular-nums text-muted-foreground">
              {completed}/{subtopics.length}
            </span>
          </button>
        </CollapsibleTrigger>
        {courseName ? (
          <span className="hidden truncate text-sm text-muted-foreground sm:block">
            {courseName}
          </span>
        ) : null}
        <TopicEditor topic={topic} compact />
        <LevelMenu topicId={topic.id} level={topic.level} />
      </div>

      <CollapsibleContent>
        <div className="mb-3 me-9 border-s ps-4 sm:me-10">
          {subtopics.map((subtopic) => (
            <SubtopicToggle
              key={subtopic.id}
              topicId={topic.id}
              subtopic={subtopic}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
